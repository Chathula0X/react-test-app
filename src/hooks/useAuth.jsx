import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearToken, readStoredToken, storeToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!readStoredToken())

  useEffect(() => {
    if (!token) {
      setUser(null)
      setReady(true)
      return
    }

    let cancelled = false
    setReady(false)

    api('/api/me', { token })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken()
          setToken(null)
          setUser(null)
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      async login(username, password) {
        const data = await api('/api/login', {
          method: 'POST',
          body: { username, password },
        })
        storeToken(data.token)
        setUser(data.user)
        setToken(data.token)
        return data.user
      },
      async register(name, username, password) {
        const data = await api('/api/register', {
          method: 'POST',
          body: { name, username, password },
        })
        storeToken(data.token)
        setUser(data.user)
        setToken(data.token)
        return data.user
      },
      logout() {
        clearToken()
        setToken(null)
        setUser(null)
      },
      setUserProgress(progress) {
        setUser((current) => (current ? { ...current, progress } : current))
      },
    }),
    [user, token, ready],
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
