// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");

// get history of player
router.get("/:playerId", async (req, res) => {
    try {
        const playerId = req.params.playerId;
        
        // get all history of player
        const QUERY = `
            SELECT toTimestamp(id) as id, opponent, status FROM history
            WHERE player_id = ?;
        `;
        const VALUES = [playerId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        return res.status(200).json({history: response.rows});
    } catch (err) {
        return res.status(500).json({err});
    }
});

module.exports = router;