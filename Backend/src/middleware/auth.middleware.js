
const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res,next) => {
    const token= req.cookies.token;
    console.log(token);
    
    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(
            decoded.id
        )
        req.user = user;
        next();

    } catch (error) {
        return res.status(400).json({
            message: "unauthorized token"
        })

    }
}
module.exports = authMiddleware;