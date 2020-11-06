const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
// SocketIO needs to be passed the raw http server
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

// Name of event + event that occurs
// Socket is an object containing information about connection
io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', 'Welcome'); // Emit to single client

    socket.on('sendMessage', (message) => {
        io.emit('message', message); // emit to all clients
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});
