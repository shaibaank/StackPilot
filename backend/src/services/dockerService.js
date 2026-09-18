const path = require('path')
const fs = require('fs')
const docker = require("../config/docker")

const languageImages = {
  javascript: 'node:alpine',
  typescript: 'node:alpine',
  python: 'python:alpine',
  go: 'golang:alpine',
  rust: 'rust:slim'
}


const createOrGetContainer = async (projectId, language = 'javascript') => {

  const containers = await docker.listContainers({ all: true })
  const existing = containers.find(c => c.Names.includes(`/project-${projectId}`))

  if (existing) {
    const container = docker.getContainer(existing.Id)
    if (existing.State !== 'running') await container.start()
    return container
  }

  const workspacePath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}`)
  fs.mkdirSync(workspacePath, { recursive: true })

  const image = languageImages[language] || 'node:alpine'

  const container = await docker.createContainer({
    name: `project-${projectId}`,
    Image: image,
    Tty: true,
    Cmd: ['/bin/sh'],
    WorkingDir: '/app',
    ExposedPorts: {
      '3000/tcp': {},
      '5173/tcp': {},
      '8080/tcp': {},
    },
    HostConfig: {
      Binds: [`${workspacePath}:/app`],
      PortBindings: {
        '3000/tcp': [{ HostPort: '0' }],
        '5173/tcp': [{ HostPort: '0' }],
        '8080/tcp': [{ HostPort: '0' }],
      }
    }
  })

  await container.start()
  return container
}

const getExistingContainer = async (projectId) => {
  const containers = await docker.listContainers({ all: true })
  const existing = containers.find(c => c.Names.includes(`/project-${projectId}`))
  if (!existing) throw new Error(`Container not found for project ${projectId}`)
  const container = docker.getContainer(existing.Id)
  if (existing.State !== 'running') await container.start()
  return container
}


module.exports = { createOrGetContainer ,getExistingContainer}