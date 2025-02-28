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
        const response = await client.execute(QUERY, VALUES, { prepare: true });

        if (!response.rowLength)
            return res.status(404).json("User not found");

        return res.status(200).json(response.rows[0]);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// fetch user name
router.get("/:id/name", async (req, res) => {
    try {
        const id = req.params.id;

        // fetch user data from users table
        const QUERY = `SELECT id, name FROM users WHERE id = ?;`;
        const VALUES = [id];
        const response = await client.execute(QUERY, VALUES, { prepare: true });

        if (!response.rowLength)
            return res.status(404).json("User not found");

        return res.status(200).json(response.rows[0]);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// update user data
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, avatar } = req.body;

        if (id !== req.userId) {
            return res.status(400).json("You are not authorized for this operation");
        }

        // update the user via db
        const QUERY = `
            UPDATE users SET name = ?, avatar = ?
            WHERE id = ?;
        `;
        const VALUES = [name, avatar, id];
        await client.execute(QUERY, VALUES, { prepare: true });

        return res.status(200).json("Account updated successfully");
    } catch (err) {
        return res.status(500).json(err);
    }
});

// fetch user current game
router.post("/current-game", async (req, res) => {
    try {
        const userId = req.userId;

        const QUERY = `
            SELECT current_game FROM users
            WHERE id = ?;
        `;
        const VALUES = [userId];
        const response = await client.execute(QUERY, VALUES, { prepare: true });

        return res.status(200).json({ currentGame: response.rows[0].current_game });
    } catch (err) {
        return res.status(500).json({ err });
    }
});

module.exports = router;
