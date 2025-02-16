// packages
const router = require('express').Router();

// custom
const { getRandomUserName } = require('../utils/misc.util');
const client = require("../utils/astra-database.util");

// create new user
router.post("/create", async (req, res) => {
    const {userId} = req.body;
    try {
        // creating random user name
        const name = getRandomUserName();

        // writing to database
        const QUERY = `
            INSERT INTO users (id, name, avatar)
            VALUES (?, ?, 0);
        `;
        const VALUES = [userId, name];
        await client.execute(QUERY, VALUES, {prepare: true});

        return res.status(200).json("Account created successfully");
    } catch (err) {
        console.log(err);
        return res.status(500).json("Error while creating account");
    } 
});

module.exports = router;