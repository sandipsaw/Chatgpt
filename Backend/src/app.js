const express = require('express');
const authRouter = require('./routes/auth.routes')
const chatRouter = require('./routes/chat.routes')
const cookies = require('cookie-parser')
const app = express();


app.use(express.json())
app.use(cookies())
app.use('/api/auth',authRouter)
app.use('/api/chat',chatRouter)

module.exports = app