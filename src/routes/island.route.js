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

module.exports = router;
