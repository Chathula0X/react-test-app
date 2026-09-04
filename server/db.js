import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const usersFile = path.join(dataDir, 'users.json')

let queue = Promise.resolve()

export function emptyProgress() {
  return {
    poems: {},
    mathsBest: 0,
    science: {},
  }
}

export async function readUsers() {
  try {
    const raw = await readFile(usersFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export async function writeUsers(users) {
  queue = queue.then(async () => {
    await mkdir(dataDir, { recursive: true })
    await writeFile(usersFile, JSON.stringify(users, null, 2))
  })
  return queue
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    progress: user.progress ?? emptyProgress(),
  }
}

export function mergeProgress(current = emptyProgress(), incoming = {}) {
  const poems = { ...(current.poems ?? {}) }
  for (const [id, read] of Object.entries(incoming.poems ?? {})) {
    if (read) poems[id] = true
  }

  const science = { ...(current.science ?? {}) }
  for (const [id, score] of Object.entries(incoming.science ?? {})) {
    science[id] = Math.max(Number(science[id] || 0), Number(score) || 0)
  }

  return {
    poems,
    mathsBest: Math.max(Number(current.mathsBest) || 0, Number(incoming.mathsBest) || 0),
    science,
  }
}
