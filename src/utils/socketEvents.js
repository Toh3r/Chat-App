// Handle Socket Events

// Import message and user functions
const { generateMessage, generateLocationMessage } = require("./messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const translate = require("./translate");

exports = module.exports = function (io) {
    // On user connect
    io.on("connection", (socket) => {
        console.log("New WebSocket Connection");

        // When a user joins a group
        socket.on("join", (options, callback) => {
            const { error, user } = addUser({ id: socket.id, ...options });

            if (error) {
                return callback(error);
            }

            socket.join(user.room); // Add user to a group chat

            socket.broadcast
                .to(user.room)
                .emit(
                    "message",
                    generateMessage(`${user.username} has joined the room`)
                );

            // Populate group info on sidebar
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });

            callback();
        });

        // When a user sends a message to a group
        socket.on("sendMessage", (oMessageInfo, callback) => {
            const user = getUser(socket.id);
            if (oMessageInfo.bTranslate === true) {
                translate(oMessageInfo, (message) => {
                    oMessageInfo.message = message;
                    io.to(user.room).emit(
                        "message",
                        generateMessage(user.username, oMessageInfo.message)
                    );
                    callback();
                });
            } else {
                io.to(user.room).emit(
                    "message",
                    generateMessage(user.username, oMessageInfo.message)
                );
                callback();
            }
        });

        // When a user send their location
        socket.on("sendLocation", (coords, callback) => {
            const user = getUser(socket.id);
            const userCoords = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
            io.to(user.room).emit(
                "locationMessage",
                generateLocationMessage(user.username, userCoords)
            ); // emit to all clients
            callback();
        });

        // When user leaves group
        socket.on("disconnect", () => {
            const user = removeUser(socket.id);
            if (user) {
                io.to(user.room).emit(
                    "message",
                    generateMessage(`${user.username} has left ${user.room}`)
                );
                io.to(user.room).emit("roomData", {
                    room: user.room,
                    users: getUsersInRoom(user.room),
                });
            }
        });
    });
};
