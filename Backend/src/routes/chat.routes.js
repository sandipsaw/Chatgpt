const express = require('express');
const authMiddleware = require('../middleware/auth.middleware')
const chatController = require('../controller/chatController')
const router = express.Router();


router.post('/',authMiddleware,chatController)
module.exports= router