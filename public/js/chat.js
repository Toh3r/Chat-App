const socket = io();

// Recieve event from server
socket.on('message', (message) => {
    console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    // Stop page refresh on submit click
    e.preventDefault()

    // Get value from text input
    // e represents everything being listened for on the form
    const message = e.target.elements.message.value;

    // // Emit to server
    socket.emit('sendMessage', message);
});

