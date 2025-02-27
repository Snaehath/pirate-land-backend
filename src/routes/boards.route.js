// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");

// update position when in ready state
router.put("/ready/:islandId/:position", async (req, res) => {
    try {
        const userId = req.userId;
        const islandId = req.params.islandId;
        const position = req.params.position;

        // fetch island status
        const QUERY = `
            SELECT status FROM islands
            WHERE id = ?;
        `;
        const VALUES = [islandId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        const islandStatus = response.rows[0]?.status ?? "READY";

        // can't update when island status
        // is not READY
        if (islandStatus !== "READY") {
            return res.status(400).json("Island not ready");
        }

        // fetch user board
        const QUERY1 = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES1 = [islandId, userId];
        const response1 = await client.execute(QUERY1, VALUES1, {prepare: true});

        // user's board doesn't exist yet
        // so create it
        if (!response1.rowLength) {
            const QUERY2 = `
                INSERT INTO boards (island_id, player_id, positions)
                VALUES (?, ?, ?);
            `;
            const VALUES2 = [islandId, userId, `${position}-0`];
            await client.execute(QUERY2, VALUES2, {prepare: true});
        } 
        // else update the board
        else {
            let positions = response1.rows[0].positions.split(',').filter(Boolean);
            const isPresent = positions.some(p => p.split('-')[0] === position);
            
            // remove if already present
            if (isPresent) {
                positions = positions.filter(p => p.split('-')[0] !== position);
            }
            // else remove
            else {
                positions = [...positions, `${position}-0`];
            }

            // update the board
            const QUERY2 = `
                UPDATE boards SET positions = ?
                WHERE island_id = ? AND player_id = ?;
            `;
            const VALUES2 = [positions.join(","), islandId, userId];
            await client.execute(QUERY2, VALUES2, {prepare: true});
        }

        return res.status(200).json("Position updated");
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get positions count
router.get("/positions-count/:islandId/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const islandId = req.params.islandId;

        // get the positions
        const QUERY = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES = [islandId, userId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});
        
        return res.status(200).json({
            count: !response.rowLength 
                    ? 0 : 
                    response.rows[0].positions.split(',').filter(Boolean).length
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

// get actual positions
router.get("/positions/:islandId", async (req, res) => {
    try {
        const userId = req.userId;
        const islandId = req.params.islandId;

        // get the positions
        const QUERY = `
            SELECT positions FROM boards
            WHERE island_id = ? AND player_id = ?;
        `;
        const VALUES = [islandId, userId];
        const response = await client.execute(QUERY, VALUES, {prepare: true});

        return res.status(200).json({
            positions: !response.rowLength 
            ? [] : 
            response.rows[0].positions.split(",").filter(Boolean).map(v => Number(v.split('-')[0]))
        });
    } catch (err) {
        return res.status(500).json({err});
    }
});

module.exports = router;