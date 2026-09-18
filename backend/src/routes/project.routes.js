const express = require('express')
const projectRouter = express.Router()
const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/auth.middleware")




projectRouter.get('/', authMiddleware.authUser, projectController.getAllProjects)
projectRouter.get('/:projectId/folder',authMiddleware.authUser,projectController.getProjectDetails)
projectRouter.post("/createproject",authMiddleware.authUser,projectController.createProject)
projectRouter.delete('/:projectId', authMiddleware.authUser, projectController.deleteProject)





module.exports = projectRouter