const path = require('path')
const fs = require('fs').promises

async function saveFile(req, res) {
  const { projectId } = req.params
  const filePath = req.params.filePath.join('/')  // fix array to string
  const { content } = req.body
  const fullPath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}/${filePath}`)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, content, 'utf-8')
  res.status(200).json({ message: 'File saved successfully' })
}

async function getFile(req, res) { 
   console.log('params:', req.params)
  console.log('filePath:', req.params.filePath)
  const { projectId } = req.params
  const filePath = req.params.filePath.join('/')  // fix here too
  const fullPath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}/${filePath}`)
  const content = await fs.readFile(fullPath, 'utf-8')
  res.status(200).json({ content })
}

async function deleteFile(req, res) {
  const { projectId } = req.params
  const filePath = req.params.filePath.join('/')
  const fullPath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}/${filePath}`)
  await fs.rm(fullPath, { recursive: true })
  res.status(200).json({ message: 'Deleted successfully' })
}

module.exports = { getFile, saveFile,deleteFile }