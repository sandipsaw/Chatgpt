const mongoose = require('mongoose')

function connectToDB(){
    
    // try{
    //     mongoose.connect(process.env.MONGODB_URI)
    //     console.log("Database is Now connected");
    // }catch(error){
    //     console.log(error);   
    // }

    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Database is connected");
    }).catch((err)=>{
        console.log(err);
 
    })


}

module.exports = connectToDB;