import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../hooks/useApp'
import { t } from '../lib/i18n'

const FACES = ['🦊', '🐢', '🐼', '🐥', '🐸', '🦋']

export default function ProfilePicker() {
  const { ready, profiles, selectProfile, addProfile } = useApp()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦊')

  function open(id: string) {
    selectProfile(id)
    navigate('/home')
  }

  function save() {
    addProfile(name, avatar)
    navigate('/home')
  }

  if (!ready) return null

  return (
    <AppShell
      wide
      footer={
        adding ? (
          <button type="button" className="btn-primary md:max-w-sm md:mx-auto" onClick={save}>
            {t('picker.save')}
          </button>
        ) : null
      }
    >
      <h1 className="si mb-6 text-center text-2xl font-bold text-ink md:text-4xl">{t('picker.title')}</h1>
      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(p.id)}
            className="min-h-28 rounded-2xl border-2 border-border bg-surface p-4 text-center hover:border-border-interactive hover:bg-primary-soft md:min-h-36"
          >
            <div className="text-4xl md:text-5xl">{p.avatar}</div>
            <div className="si mt-2 truncate text-base md:text-lg">{p.name}</div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="min-h-28 rounded-2xl border-2 border-dashed border-border text-4xl text-soft hover:border-border-interactive hover:bg-primary-soft md:min-h-36"
        >
          ＋
        </button>
      </div>
      {adding && (
        <div className="mx-auto mt-8 w-full max-w-md space-y-4">
          <div className="flex flex-wrap justify-center gap-3">
            {FACES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setAvatar(f)}
                className={`grid h-12 w-12 place-items-center rounded-full text-2xl ${
                  avatar === f ? 'bg-primary-soft ring-2 ring-primary' : ''
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('picker.name')}
            className="si w-full rounded-xl border-2 border-border bg-surface p-3 text-lg text-ink outline-none focus:border-primary focus:bg-primary-soft"
          />
        </div>
      )}
    </AppShell>
  )
}
