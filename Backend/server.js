require('dotenv').config();
const connectToDB = require('./src/db/db')
const app = require('./src/app')
const { createServer } = require("http");
const httpServer = createServer(app);
const initSocketServer = require('./src/sockets/socket.server')

connectToDB()

initSocketServer(httpServer)


httpServer.listen(3000,()=>{
    console.log("Server is running on port 3000");
})