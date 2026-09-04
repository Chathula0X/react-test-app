import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function GuestOnly() {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center px-4 text-center">
        <p className="font-display text-2xl text-violet-900">Getting your stars ready…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
