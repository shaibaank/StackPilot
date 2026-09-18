
const express = require('express')
const app = express()
const cors = require('cors')

const cookieParser = require("cookie-parser")


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

/* require routes */
const projectRouter = require("./routes/project.routes")
const authRouter = require("./routes/auth.routes")
const fileRouter = require("./routes/file.routes")
const agentRouter = require("./routes/agent.routes")
/* using routes */
app.use('/auth',authRouter)
app.use('/project',projectRouter)
app.use('/file', fileRouter)
app.use('/agent',agentRouter)


module.exports = app

