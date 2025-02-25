const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const origins = ["http://localhost:5173"];

const io = new Server(httpServer, {
  cors: {
    origin: [...origins],
  },
});

module.exports = {
  app,
  httpServer,
  io,
};
