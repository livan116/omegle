// sockets/socketHandlers.js

const rooms = {}; // Tracks users in rooms: { roomId: [socketId1, socketId2] }

function handleSocketConnection(socket, io) {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);

    socket.emit("room-joined");

    if (rooms[roomId].length === 2) {
      // Notify each peer about the other
      const [id1, id2] = rooms[roomId];
      io.to(id1).emit("peer-connected", { peerId: id2 });
      io.to(id2).emit("peer-connected", { peerId: id1 });
    }

    // Relay offer
    socket.on("offer", ({ offer, to }) => {
      io.to(to).emit("offer", { offer, from: socket.id });
    });

    // Relay answer
    socket.on("answer", ({ answer, to }) => {
      io.to(to).emit("answer", { answer, from: socket.id });
    });

    // Relay ICE candidate
    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
}

module.exports = { handleSocketConnection };
