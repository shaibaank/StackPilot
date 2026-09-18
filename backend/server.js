require('dotenv').config()

const app = require('./src/app')
const http = require('http')
const { Server: SocketServer } = require('socket.io')
const terminalSocket = require('./src/socket/terminalSocket')
const server = http.createServer(app)
const connectDb = require("./src/config/database")
const io = new SocketServer(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
         credentials: true
    }
})
app.set('io', io)
connectDb()


terminalSocket(io)

server.listen(8000, () => {
    console.log('Server is running on port 8000')
})