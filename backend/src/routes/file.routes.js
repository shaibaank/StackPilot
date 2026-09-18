const express = require('express')
const fileRouter = express.Router()
const fileController = require('../controllers/file.controller')
const authMiddleware = require('../middlewares/auth.middleware')

fileRouter.get('/:projectId/*filePath', authMiddleware.authUser, fileController.getFile)
fileRouter.post('/:projectId/*filePath', authMiddleware.authUser, fileController.saveFile)
fileRouter.delete('/:projectId/*filePath', authMiddleware.authUser, fileController.deleteFile)

module.exports = fileRouter