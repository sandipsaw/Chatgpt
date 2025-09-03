
const chatModel = require('../model/chat.model')


const chatController = async(req,res)=>{
    const {title} = req.body;
    const user =req.user
    
    const chat = await chatModel.create({
        title,
        user:user._id
    })

    res.status(201).json({
        message:"chat created succesfully",
        chat:{
            title:chat.title,
            user:chat.user,
            lastActivity:chat.lastActivity,
            _id:chat._id
        }
    })
}

module.exports = chatController