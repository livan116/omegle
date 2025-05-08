// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { handleSocketConnection } = require("./sockets/socketHandlers.js");
const { loadServerConfig } = require("./config/serverConfig.js");

// Load environment variables
dotenv.config();
const app = express();
const server = http.createServer(app);

// Allow cross-origin for frontend connection
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // your Vite dev server
    methods: ["GET", "POST"],
    credentials: true,
  })
);
// Load Config
const { PORT, CLIENT_ORIGIN } = loadServerConfig();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // allow frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);
  handleSocketConnection(socket, io);
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Server running ");
});

// Start server
server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
