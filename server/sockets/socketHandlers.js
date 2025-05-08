// sockets/socketHandlers.js
const { initSignaling } = require('./signaling');

const handleSocketConnection = (socket, io) => {
  console.log(`Socket connected: ${socket.id}`);

  // Setup WebRTC signaling
  initSignaling(socket, io);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};

module.exports = { handleSocketConnection };