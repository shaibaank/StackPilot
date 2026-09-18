const fs = require('fs/promises')
const path = require('path')
const fsSync = require('fs')

async function generateFileTree(directory) {
  if (!fsSync.existsSync(directory)) {
    throw new Error(`Directory does not exist: ${directory}`)
  }
  const tree = {}

  async function buildTree(currentDir, currentTree) {
    let files
    try {
      files = await fs.readdir(currentDir)
    } catch (err) {
      return
    }

    for (const file of files) {
      if (file === 'node_modules' || file === '.git') continue
      const filePath = path.join(currentDir, file)
      try {
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) {
          currentTree[file] = {}
          await buildTree(filePath, currentTree[file])
        } else {
          currentTree[file] = null
        }
      } catch (err) {
        continue
      }
    }
  }

  await buildTree(directory, tree)
  return tree
}

module.exports = generateFileTree