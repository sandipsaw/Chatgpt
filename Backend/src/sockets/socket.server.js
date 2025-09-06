const { Server } = require("socket.io")
const jwt = require('jsonwebtoken');
const userModel = require("../model/user.model");
const cookie = require('cookie')
const { generateRespone, generateVector } = require('../service/ai.service');
const { response } = require("../app");
const messageModel = require('../model/message.model')
const { craeteMemory, queryMemory } = require('../service/vector.service');
const { context } = require("@pinecone-database/pinecone/dist/assistant/data/context");
const { memo } = require("react");

const initSocketServer = (httpServer) => {
    const io = new Server(httpServer);

    io.use(async (Socket, next) => {
        const cookies = cookie.parse(Socket.handshake.headers?.cookie)

        if (!cookies.token) {
            next(new Error("token is not provided"))
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.id)
            Socket.user = user
            console.log(Socket.user);

            next();

        } catch (err) {
            next(new Error("invalid token"));
        }
    })

    io.on("connection", (Socket) => {
        Socket.on("ai-message", async (messagePayload) => {
            console.log("Raw messagePayload:", messagePayload, typeof messagePayload);

            const messages = await messageModel.create({
                user: Socket.user._id,
                chat: messagePayload.chatid,
                content: messagePayload.content,
                role: "user",
            })


            const vectors = await generateVector(messagePayload.content);

            console.log(vectors);


             const memory = await queryMemory({
                queryVector:vectors,
                limit:1,
                metadata:{}
            })

            await craeteMemory({
                messageId:messages._id,
                vectors,
                metadata:{
                    chat:messagePayload.chatid,
                    user:Socket.user._id,
                    text:messagePayload.content
                }

            })

           

            console.log(memory);
            
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
            }).sort({ createdAt: -1 }).limit(4).lean()).reverse();

            // console.log("chatHistory ==> ",chatHistory.map(item => {
            //     return{
            //     role: item.role,
            //     part:[{text:item.content}]
            //     }
            // }));

            const response = await generateRespone(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            }));


            const responseMessage = await messageModel.create({
                user: Socket.user._id,
                chat: messagePayload.chatid,
                content: response,
                role: "model",
            })

            const ResponseVector = await generateVector(response)

            await craeteMemory({
                messageId:responseMessage._id,
                vectors:ResponseVector,
                metadata:{
                    chat:messagePayload.chatid,
                    user:Socket.user._id,
                    text:response
                }
            })


            Socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chatid
            })
            console.log(response);

        })
    })

}

module.exports = initSocketServer

