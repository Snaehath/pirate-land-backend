// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const { getUpdatedPositions, isAllPositionsCaught, updateLeaderBoard } = require("../utils/misc.util");

// update position when in ready state
router.put("/ready/:islandId/:position", async (req, res) => {
    try {
        const userId = req.userId;
        const islandId = req.params.islandId;
        const position = req.params.position;

        // fetch island status
        const QUERY = `
            SELECT status FROM islands
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        const islandStatus = response.rows[0]?.status ?? "READY";

        // can't update when island status
        // is not READY
        if (islandStatus !== "READY") {
            return res.status(400).json("Island not ready");
        }

        // fetch user board
        const QUERY1 = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES1 = [islandId, userId];
        const response1 = await client.execute(QUERY1, VALUES1, {prepare: true});

        // user's board doesn't exist yet
        // so create it
        if (!response1.rowLength) {
            const QUERY2 = `
                INSERT INTO boards (island_id, player_id, positions)
                VALUES (?, ?, ?);
            `;
            const VALUES2 = [islandId, userId, `${position}-0`];
            await client.execute(QUERY2, VALUES2, {prepare: true});
        } 
        // else update the board
        else {
            let positions = response1.rows[0].positions.split(',').filter(Boolean);
            const isPresent = positions.some(p => p.split('-')[0] === position);
            
            // remove if already present
            if (isPresent) {
                positions = positions.filter(p => p.split('-')[0] !== position);
            }
            // else remove
            else {
                positions = [...positions, `${position}-0`];
            }

            // update the board
            const QUERY2 = `
                UPDATE boards SET positions = ?
                WHERE island_id = ? AND player_id = ?;
            `;
            const VALUES2 = [positions.join(","), islandId, userId];
            await client.execute(QUERY2, VALUES2, {prepare: true});
        }

        return res.status(200).json("Position updated");
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get positions count
router.get("/positions-count/:islandId/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const islandId = req.params.islandId;

        // get the positions
        const QUERY = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES = [islandId, userId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});
        
        return res.status(200).json({
            count: !response.rowLength 
                    ? 0 : 
                    response.rows[0].positions.split(',').filter(Boolean).length
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get positions
router.get("/positions/:islandId/:opponentId", async (req, res) => {
    try {
        const userId = req.userId;
        const islandId = req.params.islandId;
        const opponentId = req.params.opponentId;

        // get user positions
        const QUERY = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES = [islandId, userId];
        const userPositions = (await client.execute(QUERY, VALUES, {prepare: true})).rows[0]?.positions ?? "";
        
        // get opponent positions
        const QUERY1 = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES1 = [islandId, opponentId];
        const opponentPositions = (await client.execute(QUERY1, VALUES1, {prepare: true})).rows[0]?.positions ?? "";

        // response to send
        const positions = userPositions.split(",").filter(Boolean).map(p => Number(p.split("-")[0]));
        const captures = opponentPositions.split(",").filter(Boolean).filter(p => p.split("-")[1] === "1").map(p => Number(p.split("-")[0]));
        const captured = userPositions.split(",").filter(Boolean).filter(p => p.split("-")[1] === "1").map(p => Number(p.split("-")[0]));

        return res.status(200).json({
            positions,
            captures,
            captured,
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

// try capture
router.put("/positions/:islandId/:opponentId/:position/:isCreator", async (req, res) => {
    try {
        const userId = req.userId;
        const islandId = req.params.islandId;
        const opponentId = req.params.opponentId;
        const position = Number(req.params.position);
        const isCreator = req.params.isCreator === "true";

        // get opponent positions
        const QUERY = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES = [islandId, opponentId];
        const opponentPositions = (await client.execute(QUERY, VALUES, {prepare: true})).rows[0]?.positions ?? "";

        const positions = opponentPositions.split(",").filter(Boolean).map(p => Number(p.split("-")[0]));

        // update chance in island
        const QUERY1 = `
            UPDATE islands SET chance = ?
            WHERE id = ?;
        `;
        const VALUES1 = [opponentId, islandId];
        await client.execute(QUERY1, VALUES1, {prepare: true});

        // check if miss then simply send
        // it was miss
        if (!positions.includes(position)) {
            return res.status(200).json({wasHit: false, gameEnded: false});
        }

        // update the opponents board
        const updatedPositions = getUpdatedPositions(opponentPositions, position);
        const QUERY2 = `
            UPDATE boards SET positions = ?
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES2 = [updatedPositions, islandId, opponentId];
        await client.execute(QUERY2, VALUES2, {prepare: true});

        // update the scoreboard
        let QUERY3 = `
            UPDATE scorecards SET invitee_score += 1
            WHERE island_id = ?;
        `;
        if (isCreator) {
            QUERY3 = `
                UPDATE scorecards SET creator_score += 1
                WHERE island_id = ?;
            `;  
        }
        const VALUES3 = [islandId];
        await client.execute(QUERY3, VALUES3, {prepare: true});

        const gameEnded = isAllPositionsCaught(updatedPositions);

        // when game is ended
        if (gameEnded) {
            // update islands
            const QUERY4 = `
                UPDATE islands SET status = ?
                WHERE id = ?;
            `;
            const VALUES4 = ["ENDED", islandId];
            await client.execute(QUERY4, VALUES4, {prepare: true});

            // set current game of both users to null
            const QUERY5 = `
                DELETE current_game FROM users
                WHERE id in (?, ?);
            `;
            const VALUES5 = [userId, opponentId];
            await client.execute(QUERY5, VALUES5, {prepare: true});

            // update current user history as won against opponent
            const QUERY6 = `
                INSERT INTO history (player_id, island_id, opponent, status, id)
                VALUES (?, ?, ?, ?, now());
            `;
            const VALUES6 = [userId, islandId, opponentId, "WON"];
            await client.execute(QUERY6, VALUES6, {prepare: true});
            
            // update opponent history as lost against user
            const QUERY7 = `
                INSERT INTO history (player_id, island_id, opponent, status, id)
                VALUES (?, ?, ?, ?, now());
            `;
            const VALUES7 = [opponentId, islandId, userId, "LOST"];
            await client.execute(QUERY7, VALUES7, {prepare: true});

            // update leaderboard
            await updateLeaderBoard(userId, true);
            await updateLeaderBoard(opponentId, false);
        }

        return res.status(200).json({wasHit: true, gameEnded});
    } catch (err) {
        console.log({err});
        return res.status(500).json({err});
    }
});

module.exports = router;