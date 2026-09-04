import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center px-4 text-center">
        <p className="font-display text-2xl text-violet-900">Getting your stars ready…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
