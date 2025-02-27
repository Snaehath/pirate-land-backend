// custom
const client = require("./astra-database.util");

// add to sockets table
const registerSocket = async (userId, socketId) => {
  const QUERY = `INSERT INTO sockets(id, socket_id) VALUES (?, ?);`;
  const VALUES = [userId, socketId];
  try {
      await client.execute(QUERY, VALUES, {prepare: true});
  } catch (err) {
      console.log(err);
  }
};

// remove from sockets table
const unRegisterSocket = async (socketId) => {
  const QUERY = `SELECT id FROM sockets WHERE socket_id = ?;`;
  const VALUES = [socketId];
  try {
      const {rowLength, rows} = await client.execute(QUERY, VALUES, {prepare: true});
      if (!rowLength) return;
      const {id} = rows[0];
      const QUERY1 = `DELETE FROM sockets WHERE id = ?;`;
      const VALUES1 = [id];
      await client.execute(QUERY1, VALUES1, {prepare: true});
  } catch (err) {
      console.log(err);
  }
};

const socketHandler = (io) => {
  // user logs in
  io.on("connection", socket => {
    console.log(`[SOCKET] ${socket.id} Connected`);
    const {userId} = socket.handshake.query;
    registerSocket(userId, socket.id);
    // user leaves tab or logs out
    socket.on("disconnect", () => {
      console.log(`[SOCKET] ${socket.id} Disconnected`);
      unRegisterSocket(socket.id);
    });
    // user joins room
    socket.on("joinRoom", roomId => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("playerJoined", {userId});
      console.log(`[SOCKET] ${socket.id} joined ${roomId}`);
    });
    // user leaves room
    socket.on("leaveRoom", roomId => {
      socket.leave(roomId);
      socket.broadcast.to(roomId).emit("playerLeft", {userId});
      console.log(`[SOCKET] ${socket.id} left ${roomId}`);
    });
    // creator update game to ready state
    socket.on("readyGame", roomId => {
      socket.broadcast.to(roomId).emit("readyGame", {roomId});
      console.log(`[SOCKET] Island ${roomId} is ready`);
    });
    // user updates chat
    socket.on("newMessage", ({roomId, msgObj}) => {
      socket.broadcast.to(roomId).emit("newMessage", msgObj);
      console.log(`[SERVER] ${socket.id} message to ${roomId}`);
    });
    // user makes a placement
    socket.on("placement", (roomId) => {
      socket.broadcast.to(roomId).emit("placement");
      console.log(`[SERVER] ${socket.id} placement to ${roomId}`);
    });
    // creator update game to started state
    socket.on("startedGame", roomId => {
      io.to(roomId).emit("startedGame", {roomId});
      console.log(`[SOCKET] Island ${roomId} is started`);
    });
    // player was captured
    socket.on("captured", ({roomId, position}) => {
      socket.broadcast.to(roomId).emit("captured", {position});
      console.log(`[SERVER] ${socket.id} captured at ${position}`);
    });
    // chance gets updated
    socket.on("chanceUpdate", ({roomId, playerId}) => {
      socket.broadcast.to(roomId).emit("chanceUpdate", {playerId});
      console.log(`[SERVER] ${socket.id} updated chance as ${playerId} in ${roomId}`);
    });
    // game was ended
    socket.on("endedGame", ({roomId}) => {
      socket.broadcast.to(roomId).emit("endedGame", {roomId});
      console.log(`[SOCKET] Island ${roomId} is ended`);
    });
  });
};

module.exports = socketHandler;
