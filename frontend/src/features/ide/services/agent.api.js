import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/agent",
  withCredentials: true,
})

export async function runAgent(projectId, prompt, conversationHistory = []) {
  const response = await api.post(`/${projectId}`, { 
    prompt,
    conversationHistory 
  })
  return response.data
}