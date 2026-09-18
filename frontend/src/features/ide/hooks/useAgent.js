import { useState } from "react"
import { runAgent } from "../services/agent.api"

export const useAgent = (projectId) => {
  const [agentMessages, setAgentMessages] = useState([])
  const [agentLoading, setAgentLoading] = useState(false)

  const handleAgentRun = async (prompt) => {
    if (!prompt?.trim() || agentLoading) return
    setAgentLoading(true)

    // add user message + loading
    setAgentMessages(prev => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'loading' }
    ])

    try {
      // send conversation history for context
      const history = agentMessages.filter(m => m.role !== 'loading')

      const data = await runAgent(projectId, prompt, history)

      setAgentMessages(prev => [
        ...prev.filter(m => m.role !== 'loading'),
        {
          role: 'assistant',
          content: data.message,
          rawContent: data.message,
          type: data.type,
          files: data.filesChanged,
          installCommands: data.installCommands,
          startCommand: data.startCommand,
          envVars: data.envVars,
          terminalCommands: data.terminalCommands
        }
      ])
    } catch (err) {
      setAgentMessages(prev => [
        ...prev.filter(m => m.role !== 'loading'),
        { role: 'assistant', content: 'Something went wrong. Try again.', type: 'chat' }
      ])
    } finally {
      setAgentLoading(false)
    }
  }

  const clearMessages = () => setAgentMessages([])

  return { agentMessages, agentLoading, handleAgentRun, clearMessages }
}