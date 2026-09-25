import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../hooks/useApp'
import { getLessonCount, getLessonMeta } from '../lib/items'
import { t } from '../lib/i18n'

function displayName(name: string) {
  return name.replace(/(^|\s)\S/g, (ch) => ch.toUpperCase())
}

export default function Home() {
  const { ready, profile, startOrResumeLesson } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!ready) return
    if (!profile) navigate('/', { replace: true })
  }, [ready, profile, navigate])

  if (!ready || !profile) return null

  const totalLessons = getLessonCount()
  const meta = getLessonMeta(profile.lessonNumber)
  const unitDone = !meta
  const progress = Math.min(100, Math.max(8, ((profile.lessonNumber - 1) / totalLessons) * 100))
  const name = displayName(profile.name)

  function go() {
    if (unitDone) return
    startOrResumeLesson()
    navigate('/lesson')
  }

  return (
    <AppShell wide>
      <header className="mb-6 flex justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3.5 py-1.5 text-base font-bold text-ink shadow-[0_2px_0_var(--color-warning)] md:px-4 md:py-2 md:text-lg">
          <span aria-hidden>⭐</span>
          <span className="en tabular-nums leading-none">{profile.stars}</span>
        </span>
      </header>

      <div className="grid gap-6 md:flex-1 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10">
        <div className="flex items-center gap-4 text-left md:gap-5">
          <div className="grid h-17 w-17 shrink-0 place-items-center rounded-full bg-primary-soft text-[2rem] ring-2 ring-border-interactive md:h-21 md:w-21 md:text-[2.5rem]">
            🌈
          </div>
          <div className="min-w-0">
            <h1 className="leading-snug text-ink">
              <span className="si text-[1.55rem] font-bold md:text-[1.9rem]">{t('greeting.hello')}</span>{' '}
              <span className="en text-[1.55rem] font-extrabold md:text-[1.9rem]">{name}!</span>
            </h1>
            <p className="si mt-1.5 text-base leading-snug text-soft md:text-lg">
              {unitDone ? t('home.finished') : t('home.prompt')}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-border bg-surface p-5 md:p-6">
          <p className="si text-xl font-bold md:text-2xl">
            {unitDone ? t('unit.done') : t('lesson.label', { n: profile.lessonNumber })}
          </p>
          {!unitDone && (
            <p className="si mt-1 text-soft">
              {meta.theme_si} · {t('home.words')}
            </p>
          )}
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-border">
            <i className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          {!unitDone && (
            <button
              type="button"
              className="si mt-5 w-full min-h-12 rounded-[0.9rem] bg-primary px-4 text-[1.05rem] font-bold text-white shadow-[0_3px_0_var(--color-primary-hover)] transition hover:bg-primary-hover active:translate-y-px active:shadow-none"
              onClick={go}
            >
              {t('home.continue')}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
