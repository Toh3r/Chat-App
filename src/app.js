const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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

    // Emit to single client
    // socket.emit('message', generateMessage('Welcome')); 

    // Only emit to other connections
    // socket.broadcast.emit('message', generateMessage('A new user has joined'));

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        // Send message to room
        socket.emit('message', generateMessage('Welcome')); 
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('You Dirty Bastard');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message)); // emit to all clients
        callback(); // Acknowledges event
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        const userCoords = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, userCoords)); // emit to all clients
        callback();
    });

    // When connection is disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left ${user.room}`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
});
