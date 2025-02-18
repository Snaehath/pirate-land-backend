// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");

// fetch user data
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // fetch user data from users table
        const QUERY = `SELECT * FROM users WHERE id = ?;`;
        const VALUES = [id]; 
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        if (!response.rowLength)
            return res.status(404).json("User not found");

        return res.status(200).json(response.rows[0]);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;
