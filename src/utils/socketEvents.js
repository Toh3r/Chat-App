// Handle Socket Events

// Import message and user functions
const { generateMessage, generateLocationMessage } = require("./messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

exports = module.exports = function (io) {

  // On user connect
  io.on("connection", (socket) => {
    console.log("New WebSocket Connection");

    socket.on("join", (options, callback) => {
      const { error, user } = addUser({ id: socket.id, ...options });

      if (error) {
        return callback(error);
      }

      socket.join(user.room); // Add user to a group chat

      // Send message to group
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

    socket.on("sendMessage", (message, callback) => {
      const user = getUser(socket.id);
      io.to(user.room).emit("message", generateMessage(user.username, message)); // emit to all clients
      callback(); // Acknowledges event
    });

    socket.on("sendLocation", (coords, callback) => {
      const user = getUser(socket.id);
      const userCoords = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(user.username, userCoords)
      ); // emit to all clients
      callback();
    });

    // When connection is disconnected
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
