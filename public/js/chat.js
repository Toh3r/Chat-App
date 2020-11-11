const socket = io();
let bTranslate = false;

// Grab elements from DOM
const $messageForm = document.querySelector('#message-form');
const $messageFormInput =$messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $translateButton = document.querySelector('#translate-btn');
const $translateFromSelect = document.querySelector('#translate-from');
const $translateToSelect = document.querySelector('#translate-to');
const $translateSelects = document.querySelector('#translate-selects');

// Grab hbs templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Autosroll to bottom of page for messages
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// Render messgages
socket.on('message', (message) => {
    console.log(bTranslate);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm a') // moment js
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

// Render location message link
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html); 
    autoscroll();
});

// Load users and display in sidebar
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

// Send Message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled'); // Disable submit while msg is being sent
    const message = e.target.elements.message.value; // e represents everything being listened for on the form

    let oMessageInfo = {
        message,
        bTranslate,
        translateFrom: $translateFromSelect.value,
        translateTo: $translateToSelect.value
    }

    socket.emit('sendMessage', oMessageInfo, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
       if (error) {
           return console.log(error);
       }
    });
});

// Send Location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    
    // Grab users location from browser and send to server
    navigator.geolocation.getCurrentPosition((position) => {
        var coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        socket.emit('sendLocation', coords, () => {
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

// Activate/de-activate translate
$translateButton.addEventListener('click', () => {
    // $translateButton.textContent = $translateButton.textContent === 'Activate Translate' ? 'Deactivate Translate' : 'Activate Translate';
    if ($translateButton.textContent === 'Activate Translate') {
        $translateButton.textContent = 'Deactivate Translate';
        $translateSelects.style.visibility = 'visible';
        bTranslate = true;
    } else {
        $translateButton.textContent = 'Activate Translate';
        $translateSelects.style.visibility = 'hidden';
        bTranslate = false;
    }
});

socket.emit('join', {  username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

