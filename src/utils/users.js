const users = []

const addUser = ({ id, username, room }) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate
    if (!room || !username) {
        return {
            error: 'Username and room are required!'
        }
    }

    // check if user exists
    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Usernams is in use!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeuser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = { addUser, getUser, getUsersInRoom, removeuser }