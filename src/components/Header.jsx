import { ArrowLeft, LogOut, Sparkles, Star } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStars } from '../hooks/useStars'

function backPath(pathname) {
  if (pathname.startsWith('/poems/')) return '/poems'
  if (pathname.startsWith('/science/')) return '/science'
  if (pathname !== '/') return '/'
  return null
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { totalStars, maxStars } = useStars()
  const backTo = backPath(pathname)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b-4 border-white/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {backTo ? (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm transition hover:bg-amber-200"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          ) : null}
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-rose-300 text-xl shadow-sm">
              <Sparkles size={22} className="text-white" />
            </span>
            <span className="truncate font-display text-xl font-semibold text-violet-900 sm:text-2xl">
              Little Learners
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-2 font-bold text-amber-800"
            aria-label={`${totalStars} of ${maxStars} stars earned`}
          >
            <Star size={20} className="fill-amber-400 text-amber-400" />
            <span>
              {totalStars}
              <span className="hidden text-amber-700/70 sm:inline">/{maxStars}</span>
            </span>
          </div>
          <span className="hidden max-w-28 truncate font-extrabold text-violet-900 sm:inline">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex size-11 items-center justify-center rounded-full bg-violet-100 text-violet-800 hover:bg-violet-200"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
