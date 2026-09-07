import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, emptyProgress, usernameToEmail } from '../firebase'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
const AuthContext = createContext(null)

function friendlyAuthError(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'That username is already taken.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Username or password is wrong.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Username must be 3–20 letters, numbers, or underscores.'
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Could not reach the internet. Try again.'
    default:
      return error?.message || 'Something went wrong. Try again.'
  }
}

async function loadUserRecord(fbUser) {
  const ref = doc(db, 'users', fbUser.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    return {
      id: fbUser.uid,
      name: data.name || fbUser.displayName || 'Learner',
      username: data.username || '',
      progress: {
        poems: data.progress?.poems ?? {},
        mathsBest: Number(data.progress?.mathsBest) || 0,
        science: data.progress?.science ?? {},
      },
    }
  }

  const record = {
    name: fbUser.displayName || 'Learner',
    username: fbUser.email?.split('@')[0] || 'learner',
    progress: emptyProgress,
  }
  await setDoc(ref, record)
  return { id: fbUser.uid, ...record }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null)
          return
        }
        setUser(await loadUserRecord(fbUser))
      } catch (error) {
        console.error(error)
        setUser(null)
      } finally {
        setReady(true)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(username, password) {
        try {
          const cred = await signInWithEmailAndPassword(
            auth,
            usernameToEmail(username),
            password,
          )
          const record = await loadUserRecord(cred.user)
          setUser(record)
          return record
        } catch (error) {
          throw new Error(friendlyAuthError(error))
        }
      },
      async register(name, username, password) {
        const trimmedName = String(name || '').trim()
        const cleanedUsername = String(username || '').trim().toLowerCase()

        if (trimmedName.length < 2 || trimmedName.length > 40) {
          throw new Error('Please type your name.')
        }
        if (!USERNAME_PATTERN.test(cleanedUsername)) {
          throw new Error('Username must be 3–20 letters, numbers, or underscores.')
        }
        if (String(password || '').length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }

        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            usernameToEmail(cleanedUsername),
            password,
          )
          await updateProfile(cred.user, { displayName: trimmedName })
          const record = {
            name: trimmedName,
            username: cleanedUsername,
            progress: emptyProgress,
          }
          await setDoc(doc(db, 'users', cred.user.uid), record)
          const userRecord = { id: cred.user.uid, ...record }
          setUser(userRecord)
          return userRecord
        } catch (error) {
          throw new Error(friendlyAuthError(error))
        }
      },
      async logout() {
        await signOut(auth)
        setUser(null)
      },
      setUserProgress(progress) {
        setUser((current) => (current ? { ...current, progress } : current))
      },
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
