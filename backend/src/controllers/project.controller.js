const mongoose = require('mongoose')
const generateFileTree = require('../utils/generateFileTree')
const projectModel = require("../models/project.model")
const {createOrGetContainer} = require("../services/dockerService")
const docker = require("../config/docker")

const path = require('path')


async function getProjectDetails(req, res) {
  const { projectId } = req.params
  
  const project = await projectModel.findOne({ projectId })  
  
  const projectPath = path.resolve(`${process.env.WORKSPACE_PATH}/${projectId}`)
  const fileTree = await generateFileTree(projectPath)

  res.status(200).json({
    message: "Project Details:",
    projectId,
    name: project.name,
    fileTree,
    ports: project.ports || {}
  })
}




async function createProject(req, res) {
    const { name, language } = req.body
    const owner = req.user.id
    
    const projectId = await new mongoose.Types.ObjectId().toString()
    const container = await createOrGetContainer(projectId,language)
    const info = await container.inspect()
    const ports = {
      3000: info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort,
       5173: info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort,
       8080: info.NetworkSettings.Ports['8080/tcp']?.[0]?.HostPort,
      }
    const workspacePath = `${process.env.WORKSPACE_PATH}/${projectId}`
    const project = await projectModel.create({
        name,
        language,
        owner,
        projectId,
        workspacePath,
        containerId: container.id,
        ports
        
    })
    
    res.status(201).json({
        message:"Project Created Successfully",project
    })



}



async function getAllProjects(req,res) {
    const owner = req.user.id
    const projects = await projectModel.find({owner})
     
    res.status(200).json({
        message: "Projects fetched successfully",
        projects: projects || [] 
   })
}

async function deleteProject(req, res) {
    const { projectId } = req.params
     try {
    const containers = await docker.listContainers({ all: true })
    const existing = containers.find(c => c.Names.includes(`/project-${projectId}`))
    if (existing) {
      const container = docker.getContainer(existing.Id)
      await container.stop()
      await container.remove()
    }
  } catch (err) {
    console.error('container delete error:', err)
    }
    await projectModel.findOneAndDelete({ projectId })
    
    res.status(200).json({ message: 'Project deleted successfully' })
}






module.exports = {
    getProjectDetails, createProject,getAllProjects,deleteProject
}