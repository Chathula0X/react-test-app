import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await register(name, username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-rose-300 shadow-sm">
          <Sparkles size={24} className="text-white" />
        </span>
        <span className="font-display text-2xl font-semibold text-violet-900">
          Little Learners
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-md sm:p-8"
      >
        <h1 className="font-display text-3xl text-violet-950">Create account</h1>
        <p className="mt-2 font-semibold text-violet-800/80">
          Make a login so your stars stay on your account.
        </p>

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 font-bold text-rose-800" role="alert">
            {error}
          </p>
        ) : null}

        <label className="mt-5 block text-left font-extrabold text-violet-900">
          Your name
          <input
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border-4 border-violet-100 px-4 text-lg font-bold text-slate-800 outline-none focus:border-violet-400"
            required
            minLength={2}
          />
        </label>

        <label className="mt-4 block text-left font-extrabold text-violet-900">
          Username
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border-4 border-violet-100 px-4 text-lg font-bold text-slate-800 outline-none focus:border-violet-400"
            required
            minLength={3}
          />
        </label>

        <label className="mt-4 block text-left font-extrabold text-violet-900">
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border-4 border-violet-100 px-4 text-lg font-bold text-slate-800 outline-none focus:border-violet-400"
            required
            minLength={6}
          />
        </label>

        <label className="mt-4 block text-left font-extrabold text-violet-900">
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border-4 border-violet-100 px-4 text-lg font-bold text-slate-800 outline-none focus:border-violet-400"
            required
            minLength={6}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 min-h-12 w-full rounded-full bg-violet-600 font-extrabold text-white disabled:opacity-70"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center font-bold text-violet-800">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-700 underline decoration-2 underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  )
}
