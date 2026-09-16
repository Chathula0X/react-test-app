import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AppState, ItemProgress } from '../types'

const DB_NAME = 'little-learners'
const DB_VERSION = 1
const LEGACY_KEY = 'little-learners-v1'

interface ProgressDB extends DBSchema {
  kv: {
    key: string
    value: AppState
  }
}

let dbPromise: Promise<IDBPDatabase<ProgressDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ProgressDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv')
        }
      },
    })
  }
  return dbPromise
}

export function emptyState(): AppState {
  return { profiles: [], activeId: null }
}

export function emptyProgress(): ItemProgress {
  return { box: 'new', streak: 0, lastSeenAt: 0, timesCorrect: 0, timesWrong: 0 }
}

export async function loadState(): Promise<AppState> {
  const db = await getDb()
  const stored = await db.get('kv', 'app')
  if (stored) return stored

  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      await saveState(parsed)
      localStorage.removeItem(LEGACY_KEY)
      return parsed
    }
  } catch {
    /* ignore broken legacy data */
  }

  return emptyState()
}

export async function saveState(state: AppState) {
  const db = await getDb()
  await db.put('kv', state, 'app')
}

export function applyAnswer(progress: ItemProgress, correct: boolean): ItemProgress {
  const next = { ...progress }
  next.lastSeenAt = Date.now()
  if (correct) {
    next.timesCorrect += 1
    if (next.box === 'new') next.box = 'learning'
    if (next.box === 'learning') {
      next.streak += 1
      if (next.streak >= 3) next.box = 'known'
    }
  } else {
    next.timesWrong += 1
    next.streak = 0
    if (next.box === 'known') next.box = 'learning'
    if (next.box === 'new') next.box = 'learning'
  }
  return next
}
