// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");

// fetch all players
router.get("/", async (req, res) => {
    try {
        const QUERY = `
            SELECT player_id, wins, total_played FROM leaderboard
            WHERE pk = 1;
        `;
        const {rows} = await client.execute(QUERY, undefined);
        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({err});
    }
});

module.exports = router;
