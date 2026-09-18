const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    username: {
        type: String,
        unique:[true,"Email already exists"]
    },
    email: {
        type: String,
        required: true,
        unique:[true,"Email already exists"]
    },
    password: {
        type: String,
        select:false
    },
    googleId: {
        type: String,
        default: null
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects"
    }]
}, {timestamps: true})


const authModel = mongoose.model("users", userSchema)


module.exports = authModel