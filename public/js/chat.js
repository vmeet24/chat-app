// Elements
const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (locationMessage) => {
    console.log(locationMessage);
    const html = Mustache.render(locationTemplate, {
        url: locationMessage.text,
        createdAt: moment(locationMessage.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const value = $messageFormInput.value
    socket.emit('sendMessage', value, () => {
        console.log('Message was delivered!');
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('GeoLocation is not supported by your browser! :(')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        position.coords.latitude
        const corrd = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }
        socket.emit('location', corrd, () => {
            console.log('Location was shared!');
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = './'
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users })
    $sidebar.innerHTML = html
})