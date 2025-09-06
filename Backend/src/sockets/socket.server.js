const { Server } = require("socket.io")
const jwt = require('jsonwebtoken');
const userModel = require("../model/user.model");
const cookie = require('cookie')
const generateRespone = require('../service/ai.service');
const { response } = require("../app");
const messageModel = require('../model/message.model')


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
console.log("Raw messagePayload:", messagePayload, typeof messagePayload);

            await messageModel.create({
                user:Socket.user._id,
                chat:messagePayload.chatid,
                content:messagePayload.content,
                role:"user",
            })


            // .sort({ createdAt: -1 })
            //  Messages ko descending order me sort karta hai (naye → purane).

            // .limit(4)
            //  Sirf last ke 4 messages lega (kyunki humne newest first kiya tha).

            // .lean()
            //  Normally Mongoose jo return karta hai wo Mongoose Documents hote hain (extra methods ke saath).
            // .lean() use karne se data plain JavaScript objects ke form me milta hai (lightweight, fast).

            // .reverse() => chatHistory me messages purane se naye order me rahenge (natural reading order).

            const chatHistory = (await messageModel.find({
                chat: messagePayload.chatid // ek particular chat ke saare messages le aayega.
            }).sort({createdAt:-1}).limit(4).lean()).reverse();
            
            // console.log("chatHistory ==> ",chatHistory.map(item => {
            //     return{
            //     role: item.role,
            //     part:[{text:item.content}]
            //     }
            // }));
            
            const response = await generateRespone(chatHistory.map(item => {
                return{
                role: item.role,
                parts :[ {text : item.content} ]
                }
            }));
           

            await messageModel.create({
                user:Socket.user._id,
                chat:messagePayload.chatid,
                content:response,
                role:"model",
            })

            Socket.emit("ai-response",{
                content:response,
                chat:messagePayload.chatid
            })
            console.log(response);
            
        })
    })

}

module.exports = initSocketServer

