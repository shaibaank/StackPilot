const fs = require('fs/promises')
const path = require('path')
const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
})

const MASTER_PROMPT = `You are APEX — an autonomous elite full-stack software engineer and intelligent coding assistant built into FlowStack IDE. You have full access to the user's workspace files.

CAPABILITIES:
- Build complete production-grade applications from scratch
- Read, understand, and fix existing code
- Explain code, debug errors, answer questions
- Run terminal commands to install dependencies or start servers

INTENT DETECTION — decide based on user message:

1. BUILD — user wants to create something new → respond with JSON build format
2. FIX — user wants to fix/update/modify existing code → respond with JSON fix format  
3. CHAT — user is greeting, asking questions, explaining errors → respond with plain text
4. COMMAND — user wants to run something in terminal → respond with JSON command format

BUILD/FIX TRIGGERS: "build", "create", "generate", "make", "fix", "update", "add", "refactor", "change", "modify", "implement"
CHAT TRIGGERS: "hi", "hello", "what", "why", "how", "explain", "help", "what does"
COMMAND TRIGGERS: "run", "install", "start", "execute", "npm", "node"

WHEN BUILDING OR FIXING — respond ONLY with this exact JSON, no markdown, no extra text:
{
  "type": "build",
  "files": [
    { "path": "relative/path/file.js", "content": "COMPLETE file content here" }
  ],
  "message": "What was built or fixed",
  "installCommands": ["npm install express"],
  "startCommand": "node server.js",
  "envVars": { "PORT": "3000" },
  "terminalCommands": []
}

WHEN RUNNING COMMANDS — respond ONLY with this exact JSON:
{
  "type": "command",
  "message": "Running your command",
  "terminalCommands": ["npm install", "node server.js"],
  "files": [],
  "installCommands": [],
  "startCommand": null,
  "envVars": {}
}

WHEN CHATTING — respond with plain conversational text only. Be concise and technical. If showing code, use markdown code blocks.

ENGINEERING STANDARDS (for build/fix):
- Every file is 100% complete — no TODOs, no placeholders, no "add your code here"
- Production-grade error handling — try/catch, proper HTTP codes, user-friendly messages
- Security first — input validation, sanitization, no hardcoded secrets
- Clean architecture — MVC, separation of concerns
- Modern beautiful UI — proper design, spacing, colors, responsive
- Complete package.json with ALL dependencies
- Always include .env.example


When building web applications, follow these critical rules:

CORS & API RULES:
- NEVER use absolute URLs like http://localhost:3000 in frontend fetch calls — always use relative URLs like /weather
- ALWAYS serve the frontend HTML from the same Express server using res.sendFile — never as a separate file
- NEVER use APIs that require API keys — use only completely free, no-auth APIs
- For weather, use Open-Meteo API (https://api.open-meteo.com) — completely free, no key needed
- For geocoding with Open-Meteo use https://geocoding-api.open-meteo.com/v1/search?name=cityname

FILE STRUCTURE RULES:
- NEVER merge HTML and JS into the same file
- index.html goes in the same folder as server.js
- server.js serves index.html at the GET / route using res.sendFile(path.join(__dirname, 'index.html'))
- Always add const path = require('path') when using res.sendFile

SERVER RULES:
- Always listen on 0.0.0.0 — app.listen(PORT, '0.0.0.0', ...)
- Always use cors() middleware
- Always use dotenv but never require API keys for core functionality

WEATHER APP EXAMPLE using Open-Meteo:
1. First fetch coordinates: GET https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=1
2. Then fetch weather: GET https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current_weather=true
`

const readWorkspaceFiles = async (workspacePath) => {
  const files = {}
  const readDir = async (dirPath, prefix = '') => {
    let entries
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true })
    } catch { return }
    for (const entry of entries) {
      if (['node_modules', '.git', '.next', 'dist', 'build', '.cache', 'coverage'].includes(entry.name)) continue
      const fullPath = path.join(dirPath, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        await readDir(fullPath, relativePath)
      } else {
        try {
          const stat = await fs.stat(fullPath)
          if (stat.size > 50000) continue
          const content = await fs.readFile(fullPath, 'utf-8')
          files[relativePath] = content
        } catch { continue }
      }
    }
  }
  await readDir(workspacePath)
  return files
}

const runAgent = async (workspacePath, prompt, language, conversationHistory = []) => {
  const existingFiles = await readWorkspaceFiles(workspacePath)

  const fileContext = Object.entries(existingFiles)
    .map(([filePath, content]) => `[file: ${filePath}]\n${content}`)
    .join('\n\n---\n\n')

  const truncatedContext = fileContext.length > 8000
    ? fileContext.slice(0, 8000) + '\n... (truncated, more files exist)'
    : fileContext

  const systemWithContext = `${MASTER_PROMPT}

CURRENT WORKSPACE FILES:
${truncatedContext || 'Empty workspace — no files yet'}

Runtime: ${language}`

  // build messages with conversation history for context
  const messages = [
    { role: 'system', content: systemWithContext },
    ...conversationHistory.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.role === 'user' ? msg.content : msg.rawContent || msg.content
    })),
    { role: 'user', content: prompt }
  ]

  const response = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages,
    max_tokens: 16000,
  })

  const raw = response.choices[0].message.content
  console.log('APEX response length:', raw.length)

  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  const cleaned = stripped.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

  // try to detect JSON response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    // plain chat response
    return {
      type: 'chat',
      message: cleaned,
      rawContent: cleaned,
      files: [],
      installCommands: [],
      startCommand: null,
      envVars: {},
      terminalCommands: []
    }
  }

  let result
  try {
    result = JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('JSON parse failed, treating as chat:', err.message)
    return {
      type: 'chat',
      message: cleaned,
      rawContent: cleaned,
      files: [],
      installCommands: [],
      startCommand: null,
      envVars: {},
      terminalCommands: []
    }
  }

  // handle command type
  if (result.type === 'command') {
    return {
      type: 'command',
      message: result.message || 'Running commands...',
      rawContent: JSON.stringify(result),
      files: [],
      installCommands: [],
      startCommand: null,
      envVars: {},
      terminalCommands: result.terminalCommands || []
    }
  }

  // handle build/fix type — write files
  if (result.files && Array.isArray(result.files)) {
    for (const file of result.files) {
      try {
        const fullPath = path.join(workspacePath, file.path)
        await fs.mkdir(path.dirname(fullPath), { recursive: true })
        await fs.writeFile(fullPath, file.content, 'utf-8')
        console.log('wrote:', file.path)
      } catch (err) {
        console.error('Error writing file:', file.path, err.message)
      }
    }
  }

  return {
    type: result.type || 'build',
    message: result.message || 'Done',
    rawContent: JSON.stringify(result),
    files: result.files || [],
    installCommands: result.installCommands || [],
    startCommand: result.startCommand || null,
    envVars: result.envVars || {},
    terminalCommands: result.terminalCommands || []
  }
}

module.exports = { runAgent }