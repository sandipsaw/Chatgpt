require('dotenv').config();
const connectToDB = require('./src/db/db')
const app = require('./src/app')


connectToDB()

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})