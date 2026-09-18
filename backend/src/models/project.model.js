const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Project"
    },
    projectId: {
        type: String,
        required: true,
        unique: true
    },
    workspacePath: {
        type: String,
        required: true
    },
    languages: {
        type: String,
        enum:['javascript','python','typescript']
    },
    containerId: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index:true
    },
    ports: { type: Object, default: {} }
})


const projectModel = mongoose.model("projects", projectSchema)

module.exports = projectModel