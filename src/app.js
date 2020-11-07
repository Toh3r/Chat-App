const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words')

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

    // Only emit to other connections
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('You Dirty Bastard');
        }

        io.emit('message', message); // emit to all clients
        callback(); // Acknowledges event
    });

    socket.on('sendLocation', (coords, callback) => {
        const userCoords = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.emit('locationMessage', userCoords); // emit to all clients
        callback();
    });

    // When connection is disconnected
    socket.on('disconnect', () => {
        io.emit('message', 'User has left')
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});
