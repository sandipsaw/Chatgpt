const { Server, Socket } = require("socket.io")


const initSocketServer = (httpServer)=>{
    const io = new Server(httpServer);

    io.on("connection",(Socket)=>{
        console.log("server is connected now",Socket.id);
    })

}

module.exports = initSocketServer