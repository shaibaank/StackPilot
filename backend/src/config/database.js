const mongoose = require("mongoose")

async function connectDb() {
    await  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database Connected"))
}


module.exports = connectDb