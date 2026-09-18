const pty = require('node-pty')
const chokidar = require('chokidar')
const path = require('path')
const { getExistingContainer } = require('../services/dockerService')
const generateFileTree = require('../utils/generateFileTree')

const terminalSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id)

    socket.on('terminal:init', async ({ projectId, cols, rows,userId }) => {
      if (socket.ptyProcess) socket.ptyProcess.kill()
      if (socket.watcher) socket.watcher.close()
      socket.userId = userId
      socket.projectId = projectId
      const container = await getExistingContainer(projectId)

      const info = await container.inspect()
      const ports = {
        3000: info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort,
        5173: info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort,
        8080: info.NetworkSettings.Ports['8080/tcp']?.[0]?.HostPort,
      }
      console.log('emitting ports:', ports)
      socket.emit('ports:update', ports)

      const ptyProcess = pty.spawn('docker', ['exec', '-it', container.id, '/bin/sh'], {
        name: 'xterm-color',
        cols: cols || 80,
        rows: rows || 30,
        env: process.env
      })

      socket.ptyProcess = ptyProcess
      ptyProcess.onData(data => socket.emit('terminal:data', data))
      socket.on('terminal:write', data => ptyProcess.write(data))
      socket.on('terminal:resize', ({ cols, rows }) => {
        if (socket.ptyProcess) socket.ptyProcess.resize(cols, rows)
      })

      const workspacePath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}`)
      const watcher = chokidar.watch(workspacePath, {
        ignoreInitial: true,
        ignored: /(node_modules|\.git)/
      })
      socket.watcher = watcher
      watcher.on('all', async () => {
        try {
          const fileTree = await generateFileTree(workspacePath)
          socket.emit('filetree:update', fileTree)
        } catch (err) {
          console.error('filetree error:', err)
        }
      })

      socket.on('disconnect', async () => {
        console.log('socket disconnected:', socket.id)
        ptyProcess.kill()
        watcher.close()
        try {
          await container.stop()
        } catch (err) {
          // ignore already stopped
        }
      })
    })
  })
}

module.exports = terminalSocket