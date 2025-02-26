// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");
const timeuuid = require("cassandra-driver").types.TimeUuid;

// get messages by chat id
router.post(`/by_chat_id`, async (req, res) => {
    try {
        const {chatId, page} = req.body;
        const QUERY = `
            SELECT toTimestamp(id) as id, message, sender FROM messages 
            WHERE island_id = ?;
        `;
        const VALUE = [chatId];
        const queryOptions = {
            prepare: true,
            fetchSize: 3
        };
        if (page?.length > 0) queryOptions.pageState = page;
        const {rows, pageState} = await client.execute(QUERY, VALUE, {...queryOptions});
        return res.status(200).json({messages: rows, pageState});
    } catch (err) {
        return res.status(500).json(err);
    }
});

// add new message
router.post(`/new`, async (req, res) => {
    try {
        const {chatId, msg, receiver} = req.body;
        const messageId = timeuuid.now();
        const QUERY = `
          INSERT INTO messages (island_id, id, message, receiver, sender)
          VALUES (?, ?, ?, ?, ?);
        `;
        const VALUE = [chatId, messageId, msg, receiver, req.userId];
        await client.execute(QUERY, VALUE, {prepare: true});
        const resVal = {
            id: messageId,
            message: msg,
            sender: req.userId
        };
        return res.status(200).json(resVal);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;
