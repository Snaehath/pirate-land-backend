// package
const { Client } = require("cassandra-driver");

// custom
const clientConfig = require("../configs/db.config");

const client = new Client(clientConfig);

client
    .connect()
    .then(() => console.log("[SERVER] Connected to AstraDB"))
    .catch((err) => console.log(`[SERVER] AstraDB connection FAILURE - ${err.message}`));

module.exports = client;
