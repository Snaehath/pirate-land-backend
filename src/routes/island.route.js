// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const {getRandomRoomName, updateLeaderBoard} = require("../utils/misc.util");

// create island
router.post("/new", async (req, res) => {
    try {
        const userId = req.userId;
        let islandId = getRandomRoomName();

        // making sure room name doesn't exists
        while (true) {
            const QUERY = `
                SELECT id FROM islands
                WHERE id = ?;
            `;
            const VALUES = [islandId];
            const {rowLength} = await client.execute(QUERY, VALUES, {prepare: true});
            if (rowLength === 0) break;
            islandId = getRandomRoomName();
        }

        // creating island
        const QUERY1 = `
            INSERT INTO islands (id, creator, chance, status)
            VALUES (?, ?, ?, ?);
        `;
        const VALUES1 = [islandId, userId, userId, "CREATED"];
        await client.execute(QUERY1, VALUES1, {prepare: true});

        // updating user's current game
        const QUERY2 = `
            UPDATE users SET current_game = ?
            WHERE id = ?;
        `;
        const VALUES2 = [islandId, userId];
        await client.execute(QUERY2, VALUES2, {prepare: true});

        // creating score card
        const QUERY3 = `
            UPDATE scorecards SET creator_score += 0, invitee_score += 0
            WHERE island_id = ?;
        `;
        const VALUES3 = [islandId];
        await client.execute(QUERY3, VALUES3, {prepare: true});

        return res.status(200).json(islandId);
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get island info
router.get("/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;
        
        // fetch from database
        const QUERY = `
            SELECT * FROM islands
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        // when island doesn't exist
        if (!response.rowLength) {
            return res.status(400).json(`Island - "${islandId}" not found`);
        }

        // extract island info
        const {creator_payed, invitee_payed, ...rest} = response.rows[0];
        return res.status(200).json({
            ...rest, 
            creatorPayed: creator_payed, 
            inviteePayed: invitee_payed
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

// join island
router.put("/join-island/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;
        const userId = req.userId;

        // fetch the island
        const QUERY = `
            SELECT id, invitee, status FROM ISLANDS
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        // send error when island doesn't exist
        if (!response.rowLength) {
            return res.status(400).json(`Island - "${islandId}" not found`);
        }

        // extract island info
        const islandInfo = response.rows[0];

        // when game already started
        if (islandInfo.status !== "CREATED") {
            return res.status(400).json("Island already being raided");
        }

        // when game is full
        if (islandInfo.invitee !== null) {
            return res.status(400).json("Island is full");
        }

        // when all validations are passed
        // 1. update the user's current game
        const QUERY1 = `
            UPDATE users SET current_game = ?
            WHERE id = ?;
        `;
        const VALUES1 = [islandId, userId];
        await client.execute(QUERY1, VALUES1, {prepare: true});

        // 2. update invitee of the island
        const QUERY2 = `
            UPDATE islands SET invitee = ?
            WHERE id = ?;
        `;
        const VALUES2= [userId, islandId];
        await client.execute(QUERY2, VALUES2, {prepare: true});

        return res.status(200).json("Island joined successfully");
    } catch (err) {
        return res.status(500).json({err});
    }
});

// end voyage
router.put("/end-voyage/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;
        const userId = req.userId;

        // fetch island info
        const QUERY = `
            SELECT * FROM islands
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        // when island doesn't exist
        if (response.rowLength === 0)
            return res.status(400).json("Island doesn't exist");

        const islandInfo = response.rows[0];

        // when creator is leaving
        if (islandInfo.creator === userId) {
            // game is ended
            const QUERY1 = `
                UPDATE islands SET status = ?
                WHERE id = ?;
            `;
            const VALUES1 = ["ENDED", islandId];
            await client.execute(QUERY1, VALUES1, {prepare: true});
            
            // set current game of both users to null
            const QUERY2 = `
                DELETE current_game FROM users
                WHERE id in (?, ?);
            `;
            const VALUES2 = [islandInfo.creator, islandInfo.invitee ?? "1"];
            await client.execute(QUERY2, VALUES2, {prepare: true});

            // invitee is there when creator leaves
            // that means the creator has lost
            if (islandInfo.invitee !== null) {
                // update history of creator as lost against invitee
                const QUERY3 = `
                    INSERT INTO history (player_id, island_id, opponent, status, id)
                    VALUES (?, ?, ?, ?, now());
                `;
                const VALUES3 = [islandInfo.creator, islandId, islandInfo.invitee, "LOST"];
                await client.execute(QUERY3, VALUES3, {prepare: true});

                // update history of invitee as won against creator
                const QUERY4 = `
                    INSERT INTO history (player_id, island_id, opponent, status, id)
                    VALUES (?, ?, ?, ?, now());
                `;
                const VALUES4 = [islandInfo.invitee, islandId, islandInfo.creator, "WON"];
                await client.execute(QUERY4, VALUES4, {prepare: true});

                // update scoredboard of creator
                await updateLeaderBoard(islandInfo.creator, false);

                // update scoreboard of invitee
                await updateLeaderBoard(islandInfo.invitee, true);
            }
        }
        // when invitee is leaving
        else {
            // if game is just in "CREATED" state
            // another invitee can join if this
            // invitee leaves
            if (islandInfo.status === "CREATED") {
                // set current game of invitee to null
                const QUERY1 = `
                    DELETE current_game FROM users
                    WHERE id = ?;
                `;
                const VALUES1 = [islandInfo.invitee];
                await client.execute(QUERY1, VALUES1, {prepare: true});

                // set invitee of island to null
                const QUERY2 = `
                    DELETE invitee FROM islands
                    WHERE id = ?;
                `;
                const VALUES2 = [islandId];
                await client.execute(QUERY2, VALUES2, {prepare: true});
            } 
            // leaving the game in any other state
            // is considered as lost
            else {
                // game is ended
                const QUERY1 = `
                    UPDATE islands SET status = ?
                    WHERE id = ?;
                `;
                const VALUES1 = ["ENDED", islandId];
                await client.execute(QUERY1, VALUES1, {prepare: true});

                // set current game of both users to null
                const QUERY2 = `
                    DELETE current_game FROM users
                    WHERE id in (?, ?);
                `;
                const VALUES2 = [islandInfo.creator, islandInfo.invitee ?? "1"];
                await client.execute(QUERY2, VALUES2, {prepare: true});

                // update history of creator as won against invitee
                const QUERY3 = `
                    INSERT INTO history (player_id, island_id, opponent, status, id)
                    VALUES (?, ?, ?, ?, now());
                `;
                const VALUES3 = [islandInfo.creator, islandId, islandInfo.invitee, "WON"];
                await client.execute(QUERY3, VALUES3, {prepare: true});

                // update history of invitee as lost against creator
                const QUERY4 = `
                    INSERT INTO history (player_id, island_id, opponent, status, id)
                    VALUES (?, ?, ?, ?, now());
                `;
                const VALUES4 = [islandInfo.invitee, islandId, islandInfo.creator, "LOST"];
                await client.execute(QUERY4, VALUES4, {prepare: true});

                // update scoredboard of creator
                await updateLeaderBoard(islandInfo.creator, true);

                // update scoreboard of invitee
                await updateLeaderBoard(islandInfo.invitee, false);
            }
        }

        return res.status(200).json("Voyage ended successfully");
    } catch (err) {
        console.log({err});
        return res.status(500).json({err});
    }
});

// move game to ready state
router.put("/island-ready/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;

        // update island to be ready
        const QUERY = `
            UPDATE islands SET status = ?
            WHERE id = ?;
        `;
        const VALUES = ["READY", islandId];
        await client.execute(QUERY, VALUES, {prepare: true});

        return res.status(200).json("Island is now ready");
    } catch (err) {
        return res.status(500).json({err});
    }
});

// move game to started state
router.put("/island-started/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;

        // update island to be started
        const QUERY = `
            UPDATE islands SET status = ?
            WHERE id = ?;
        `;
        const VALUES = ["STARTED", islandId];
        await client.execute(QUERY, VALUES, {prepare: true});

        return res.status(200).json("Island is now ready");
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get the scorecard of the island
router.put("/scorecard/:islandId", async (req, res) => {
    try {
        const islandId = req.params.islandId;

        // fetch island info
        const QUERY = `
            SELECT creator, invitee FROM islands
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        // fetch island's scorecard
        const QUERY1 = `
            SELECT creator_score, invitee_score FROM scorecards
            WHERE island_id = ?;
        `;
        const VALUES1 = [islandId];
        const response1 = await client.execute(QUERY1, VALUES1, {prepare: true});

        return res.status(200).json({
            ...response.rows[0],
            ...response1.rows[0]
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

module.exports = router;
