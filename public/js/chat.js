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

    // Emit to server
    // function runs when event was acknowledged
    socket.emit('sendMessage', message, (error) => {
       if (error) {
           return console.log(error);
       }

       console.log('Message Delivered');
    });
});

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    
    // Grab users location from browser
    navigator.geolocation.getCurrentPosition((position) => {
        var coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        socket.emit('sendLocation', coords, () => {
            console.log('Location Shared');
        });
    });
});

