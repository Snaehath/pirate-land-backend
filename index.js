require("dotenv").config();

const { app, io, httpServer } = require("./src/utils/server");
const socketHandler = require("./src/utils/socket");
const combineMiddlewares = require("./src/utils/middleware");
const combineRoutes = require("./src/routes");

combineMiddlewares(app);
combineRoutes(app);
socketHandler(io);

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
