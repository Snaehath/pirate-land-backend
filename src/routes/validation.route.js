// packages
const router = require("express").Router();

// custom
const client = require("../utils/astra-database.util");

router.get("/server", (req, res) => {
  return res.status(200).json("SERVER - Check SUCCESS");
});

router.get("/db", async (req, res) => {
  try {
    if (client.connected) return res.status(200).json("DB - Check SUCCESS");
    throw new Error("DB - Check FAILURE");
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
