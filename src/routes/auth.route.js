// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const { isUserLoggedIn, generateAccessToken, generateRefreshToken, removeUser } = require("../utils/jwt.util");

// logging in the user
router.post("/login", async (req, res) => {
    try {
        const { userId } = req.body;

        // fetch user data
        const QUERY = `SELECT id FROM users WHERE id = ?`;
        const VALUES = [userId];
        const result = await client.execute(QUERY, VALUES, { prepare: true });

        // when user id is not available
        if (!result.rowLength)
            return res.status(400).json("Account not found");

        // extract user
        const user = result.rows[0];

        // when the user is already logged in
        if (await isUserLoggedIn(user.id))
            return res.status(400).json("Already logged in");

        // generate session token
        const sessionToken = await generateAccessToken(user.id);

        return res.status(200).json({
            sessionToken
        });
    } catch (err) {
        return res.status(500).json(err);
    }
});

// generating refresh token
router.post("/refresh", async (req, res) => {
    try {
        const token = await generateRefreshToken(req.userId);
        if (!token)
            return res.status(400).json("Cannot refresh token");
        return res.status(200).json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

// logging out user
router.delete("/logout", async (req, res) => {
    const {userId} = req;
    try {
        const isLogged = await isUserLoggedIn(userId);
        if (!isLogged)
            return res.status(400).json("Not logged in");
        await removeUser(userId);
        return res.status(200).json("Logged out successfully");
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports = router;
