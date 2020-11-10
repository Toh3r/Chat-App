// Import frameworks/packages
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// Configure express and SocketIO
const app = express();
const server = http.createServer(app); // SocketIO needs to be passed the raw http server
const io = socketio(server);
const socketEvents = require('./utils/socketEvents')(io);
const port = process.env.PORT; // If local use 3000 else use assigned port
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

// Listen on whatever port is being used
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});
