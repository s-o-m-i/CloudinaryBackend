const mongoose = require("mongoose")
const URI = "mongodb://127.0.0.1:27017/cloudinary"
const connectDb =async()=>{
    try {
        const isConnected = await mongoose.connect(URI)
        console.log("Database is successfully connected")
    } catch (error) {
        console.log("failed to connect database",error)
    }
}
module.exports = connectDb