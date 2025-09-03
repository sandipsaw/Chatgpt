const { Server, Socket } = require("socket.io")
const jwt = require('jsonwebtoken');
const userModel = require("../model/user.model");
const cookie = require('cookie')
const generateRespone = require('../service/ai.service');
const { response } = require("../app");

const initSocketServer = (httpServer)=>{
    const io = new Server(httpServer);

    io.use(async(Socket,next)=>{
        const cookies = cookie.parse(Socket.handshake.headers?.cookie)
        
        if(!cookies.token){
            next(new Error("token is not provided"))
        }
 
        try{
            const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.id)
            Socket.user = user
            console.log(Socket.user);
            
            next();

        }catch(err){
            next(new Error("invalid token"));
        }
    })

    io.on("connection",(Socket)=>{
        Socket.on("ai-message",async(messagePayload)=>{
            const response = await generateRespone(messagePayload.content)
            console.log(response);

            Socket.emit("ai-response",{
                content:response,
                chatid:messagePayload.chatid
            })
            console.log(response);
            
        })
    })

}

module.exports = initSocketServer