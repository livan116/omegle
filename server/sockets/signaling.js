// sockets/signaling.js

const initSignaling = (socket, io) => {
    // Join room event
    socket.on("join-room", (roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);
  
      const numClients = room ? room.size : 0;
  
      if (numClients === 0) {
        socket.join(roomId);
        socket.emit("room-joined", { roomId });
      } else if (numClients === 1) {
        socket.join(roomId);
        socket.emit("room-joined", { roomId });
        socket.to(roomId).emit("peer-connected", { peerId: socket.id });
      } else {
        socket.emit("room-full");
      }
    });
  
    // Handle offer
    socket.on("offer", ({ offer, to }) => {
      socket.to(to).emit("offer", { offer, from: socket.id });
    });
  
    // Handle answer
    socket.on("answer", ({ answer, to }) => {
      socket.to(to).emit("answer", { answer, from: socket.id });
    });
  
    // Handle ICE candidate exchange
    socket.on("ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });
  
    // Handle disconnect
    socket.on("disconnect", () => {
      socket.broadcast.emit("peer-disconnected", { peerId: socket.id });
    });
  };
  
  module.exports = { initSignaling }