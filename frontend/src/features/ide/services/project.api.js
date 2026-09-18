import axios from "axios"


const api = axios.create({
    baseURL: "http://localhost:8000/project",
    withCredentials: true
})



export async function getProjectDetails(projectId) {
    const response = await api.get(`/${projectId}/folder`)
    return response.data
}

export async function createProject(data) {
    const response = await api.post('/createproject',data)
    return response.data
}

export async function getAllProjects() {
  const response = await api.get('/')
  return response.data
}

export async function deleteProject(projectId) {
  const response = await api.delete(`/${projectId}`)
  return response.data
}