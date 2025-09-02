const userModel = require('../model/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const registerController = async(req,res)=>{
    const {email, password , fullname:{firstname,lastname}} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    })
    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"user Already exists"
        })
    }
    const hashPassword = await bcrypt.hash(password,10)

    const user = await userModel.create({
        fullname:{
            firstname, lastname
        },
        email,
        password:hashPassword,
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("token",token) 
    res.status(201).json({
        message:"User registered Succesfull",
        user:{
            email:user.email,
            _id:user._id,
            fullname:user.fullname,
        }
    })
}


const loginController = async(req,res)=>{
    const {email, password} = req.body;

    const User = await userModel.findOne({
        email
    })
    if(!User){
        return res.status(400).json({
            message:"User Not Found",
        })
    }
    const ispassword = await bcrypt.compare(password,User.password)

    if(!ispassword){
        return res.status(401).json({
            message:"Invalid password",
        })
    }
    const token = jwt.sign({id:User._id},process.env.JWT_SECRET)

    res.cookie("token",token) 

    res.status(201).json({
        message:"User logged in Succesfully",
        User:{
            email:User.email,
            _id:User._id,
            fullname:User.fullname,
        }
    })
}

module.exports = {registerController,loginController}