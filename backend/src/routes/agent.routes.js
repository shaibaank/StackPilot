const express = require('express')
const agentRouter = express.Router()
const agentControllers= require('../controllers/agent.controller')
const authMiddleware = require('../middlewares/auth.middleware')

agentRouter.post('/:projectId', authMiddleware.authUser, agentControllers.runAgentController)

module.exports = agentRouter