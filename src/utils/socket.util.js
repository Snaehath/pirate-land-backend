const socketHandler = (io) => {
  // user logs in
  io.on("connection", (socket) => {
    console.log(`[SERVER] ${socket.id} Connected`);

    // user leaves tab or logs out
    socket.on("disconnect", () => {
      console.log(`[SERVER] ${socket.id} Disconnected`);
    });
    // user joins room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`[SERVER] ${socket.id} joined ${roomId}`);
    });
    // user leaves room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`[SERVER] ${socket.id} left ${roomId}`);
    });
    // user updates room
    socket.on("updateRoom", (roomId) => {
      socket.broadcast.to(roomId).emit("updateRoom");
      console.log(`[SERVER] ${socket.id} updates ${roomId}`);
    });
    // host launched game
    socket.on("gameLaunched", (roomId) => {
      socket.broadcast.to(roomId).emit("gameLaunched");
      console.log(`[SERVER] ${socket.id} launched in ${roomId}`);
    });
    // user updates board
    socket.on("updateBoard", (roomId) => {
      socket.broadcast.to(roomId).emit("updateBoard", roomId);
      console.log(`[SERVER] ${socket.id} updates ${roomId}`);
    });
    // user updates chance to all
    socket.on("updateChance", (roomId) => {
      socket.broadcast.to(roomId).emit("updateChance");
      console.log(`[SERVER] ${socket.id} updates ${roomId}`);
    });
    // user updates every board
    socket.on("updtBrd", (roomId) => {
      socket.broadcast.to(roomId).emit("updtBrd");
      console.log(`[SERVER] ${socket.id} updates ${roomId}`);
    });
  });
};

module.exports = socketHandler;
