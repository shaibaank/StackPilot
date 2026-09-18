import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/file",
  withCredentials: true
})

export async function getFileContent(projectId, filePath) {
  const response = await api.get(`/${projectId}/${filePath}`)
  return response.data
}

export async function saveFileContent(projectId, filePath, content) {
  const response = await api.post(`/${projectId}/${filePath}`, { content })
  return response.data
}

export async function deleteFileOrFolder(projectId, filePath) {
  const response = await api.delete(`/${projectId}/${filePath}`)
  return response.data
}