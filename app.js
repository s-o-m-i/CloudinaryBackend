const express = require("express")
const app = express()
const cors = require("cors")
const PORT = 3000
const routes = require("./routes/image.routes")
const connectDb = require("./utils/DbConnect")
const cloudinary = require("cloudinary")
const dotenv = require("dotenv")
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
    api_secret: process.env.CLOUDINARY_API_SECRET // Your Cloudinary API secret
});
app.use(express.json())
app.use(cors())
app.use("/api", routes)
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})