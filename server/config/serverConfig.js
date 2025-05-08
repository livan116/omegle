// config/serverConfig.js
const loadServerConfig = () => {
    return {
      PORT: process.env.PORT || 5000,
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    };
  };
  
  module.exports = { loadServerConfig };