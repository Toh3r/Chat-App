const socket = io();

// Grab elements from DOM
const $messageForm = document.querySelector('#message-form');
const $messageFormInput =$messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Grab hbs templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

// Recieve event from server
socket.on('message', (message) => {
    console.log(message);

    // Render Messages
    const html = Mustache.render(messageTemplate, {
        message
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
    console.log(url);

    const html = Mustache.render(locationMessageTemplate, {
        url
    });
    $messages.insertAdjacentHTML('beforeend', html); 
});

$messageForm.addEventListener('submit', (e) => {
    // Stop page refresh on submit click
    e.preventDefault();

    // Disable submit while msg is being sent
    $messageFormButton.setAttribute('disabled', 'disabled');

    // Get value from text input
    // e represents everything being listened for on the form
    const message = e.target.elements.message.value;

    // Emit to server
    // anfn runs when event was acknowledged
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
       if (error) {
           return console.log(error);
       }

       console.log('Message Delivered');
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    
    // Grab users location from browser
    navigator.geolocation.getCurrentPosition((position) => {
        var coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        socket.emit('sendLocation', coords, () => {
            console.log('Location Shared');

            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

