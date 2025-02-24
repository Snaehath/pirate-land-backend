// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const {getRandomRoomName} = require("../utils/misc.util");

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
router.put("/:islandId", async (req, res) => {
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

module.exports = router;
