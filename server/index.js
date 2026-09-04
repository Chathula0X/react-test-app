import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  emptyProgress,
  mergeProgress,
  publicUser,
  readUsers,
  writeUsers,
} from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'little-learners-dev-secret'
const PORT = Number(process.env.PORT) || 3001

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/

let listening = false

function signToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '14d',
  })
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Please log in first.' })
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Please log in again.' })
  }
}

function cleanName(value) {
  return String(value || '').trim()
}

function cleanUsername(value) {
  return String(value || '').trim().toLowerCase()
}

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '32kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.post('/api/register', async (req, res) => {
    try {
      const name = cleanName(req.body?.name)
      const username = cleanUsername(req.body?.username)
      const password = String(req.body?.password || '')

      if (name.length < 2 || name.length > 40) {
        return res.status(400).json({ error: 'Please type your name.' })
      }
      if (!USERNAME_PATTERN.test(username)) {
        return res.status(400).json({
          error: 'Username must be 3–20 letters, numbers, or underscores.',
        })
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' })
      }

      const users = await readUsers()
      if (users.some((user) => user.username === username)) {
        return res.status(409).json({ error: 'That username is already taken.' })
      }

      const user = {
        id: randomUUID(),
        name,
        username,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: new Date().toISOString(),
        progress: emptyProgress(),
      }

      users.push(user)
      await writeUsers(users)

      res.status(201).json({
        token: signToken(user),
        user: publicUser(user),
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not create the account. Try again.' })
    }
  })

  app.post('/api/login', async (req, res) => {
    try {
      const username = cleanUsername(req.body?.username)
      const password = String(req.body?.password || '')
      const users = await readUsers()
      const user = users.find((entry) => entry.username === username)

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Username or password is wrong.' })
      }

      res.json({
        token: signToken(user),
        user: publicUser(user),
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not log in. Try again.' })
    }
  })

  app.get('/api/me', auth, async (req, res) => {
    try {
      const users = await readUsers()
      const user = users.find((entry) => entry.id === req.auth.userId)
      if (!user) {
        return res.status(401).json({ error: 'Please log in again.' })
      }
      res.json({ user: publicUser(user) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not load your account.' })
    }
  })

  app.put('/api/progress', auth, async (req, res) => {
    try {
      const users = await readUsers()
      const index = users.findIndex((entry) => entry.id === req.auth.userId)
      if (index === -1) {
        return res.status(401).json({ error: 'Please log in again.' })
      }

      const progress = mergeProgress(users[index].progress, req.body?.progress)
      users[index] = { ...users[index], progress }
      await writeUsers(users)

      res.json({ user: publicUser(users[index]) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Could not save your stars.' })
    }
  })

  return app
}

export function startApi(port = PORT) {
  if (listening) return
  listening = true
  const app = createApp()
  const server = app.listen(port, () => {
    console.log(`Little Learners API http://127.0.0.1:${port}`)
  })
  server.on('error', (error) => {
    listening = false
    if (error.code === 'EADDRINUSE') {
      console.log(`Little Learners API already running on ${port}`)
      listening = true
      return
    }
    console.error(error)
  })
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) {
  startApi()
}
