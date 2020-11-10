const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
// SocketIO needs to be passed the raw http server
const server = http.createServer(app);
const io = socketio(server);
const socketEvents = require('./utils/socketEvents')(io);


const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});
