const agentService = require('../services/agentService')
const projectModel = require('../models/project.model')
const path = require('path')

async function runAgentController(req, res) {
  console.log('agent hit:', req.params.projectId, req.body.prompt)
  try {
    const { projectId } = req.params
    const { prompt, conversationHistory } = req.body

    if (!prompt?.trim()) return res.status(400).json({ message: 'Prompt is required' })

    const project = await projectModel.findOne({ projectId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const workspacePath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}`)
    const result = await agentService.runAgent(
      workspacePath,
      prompt,
      project.language,
      conversationHistory || []
    )

    // pipe terminal commands to socket
    const io = req.app.get('io')
    if (io && result.terminalCommands?.length > 0) {
      const sockets = [...io.sockets.sockets.values()]
      const userSocket = sockets.find(s => s.userId === req.user?._id?.toString())
      if (userSocket) {
        for (const cmd of result.terminalCommands) {
          userSocket.emit('agent:run-command', cmd)
        }
        // also pipe install commands
        for (const cmd of result.installCommands || []) {
          userSocket.emit('agent:run-command', cmd)
        }
      }
    }

    res.status(200).json({
      type: result.type,
      message: result.message,
      filesChanged: result.files.map(f => f.path),
      installCommands: result.installCommands,
      startCommand: result.startCommand,
      envVars: result.envVars,
      terminalCommands: result.terminalCommands
    })
  } catch (err) {
    console.error('Agent error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { runAgentController }