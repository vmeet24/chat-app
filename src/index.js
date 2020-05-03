const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/message')
const { addUser, getUser, getUsersInRoom, removeuser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const filter = new Filter()
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    // console.log('New WebSocket Connection!!');

    socket.on('join', ({ username, room }, ack) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return ack(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome!!'))
        socket.broadcast.to(room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        ack()
    })

    socket.on('sendMessage', (message, ack) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, filter.clean(message)))
        ack()
    })

    socket.on('location', (location, ack) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${location.lat},${location.lon}`))
        ack()
    })

    socket.on('disconnect', () => {
        const user = removeuser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on ${port}`);
})