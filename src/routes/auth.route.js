// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const { isUserLoggedIn, generateAccessToken, generateRefreshToken, removeUser } = require("../utils/jwt.util");
const { getRandomUserName } = require("../utils/misc.util");

// logging in the user
router.post("/login", async (req, res) => {
    try {
        const { userId } = req.body;

        // fetch user data
        const QUERY = `SELECT id FROM users WHERE id = ?`;
        const VALUES = [userId];
        const result = await client.execute(QUERY, VALUES, { prepare: true });

        // when user id is not available
        // create the user
        if (!result.rowLength) {
            // creating random user name
            const name = getRandomUserName();

            // writing to users table
            const QUERY1 = `
                INSERT INTO users (id, name, avatar)
                VALUES (?, ?, 0);
            `;  
            const VALUES1 = [userId, name];
            await client.execute(QUERY1, VALUES1, {prepare: true});

            // writing to leaderboard table
            const QUERY2 = `
                INSERT INTO leaderboard (pk, player_id, wins, total_played)
                VALUES (1, ?, 0, 0);
            `;  
            const VALUES2 = [userId];
            await client.execute(QUERY2, VALUES2, {prepare: true});

            // generate session token
            const sessionToken = await generateAccessToken(userId);
            
            return res.status(200).json({
                isExisting: false,
                sessionToken
            });
        }

        // extract user
        const user = result.rows[0];

        // when the user is already logged in
        if (await isUserLoggedIn(user.id))
            return res.status(400).json("Already logged in");

        // generate session token
        const sessionToken = await generateAccessToken(user.id);

        return res.status(200).json({
            isExisting: true,
            sessionToken
        });
    } catch (err) {
        console.log({err});
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
