require("dotenv").config();

const combineMiddlewares = require("./src/utils/middleware");
const socketHandler = require("./src/utils/socket");

const { app, httpServer } = require("./src/utils/server");

combineMiddlewares(app);
socketHandler(io);

// base route
app.get("/", (req, res) => {
  return res.status(200).json("Base route for Pirate land");
});

// all other invalid routes
app.get("/*", (req, res) => {
  return res.status(400).json("Invalid route");
});

const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, async () => {
  console.clear();
  console.log(`[SERVER] Listening to PORT ${PORT}`);
});

console.log("Hello World!");

// purposely crashing
process.on("uncaughtException", async (err) => {
  server.close();
  console.log(`[SERVER] App crashed due to ${err.message}`);
  process.exit(1);
});
