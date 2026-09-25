import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../hooks/useApp'
import { getLessonMeta } from '../lib/items'
import { t } from '../lib/i18n'

export default function LessonComplete() {
  const { ready, profile, startOrResumeLesson, startLesson } = useApp()
  const navigate = useNavigate()
  if (!ready || !profile) return null

  const hasNext = Boolean(getLessonMeta(profile.lessonNumber))
  const lastLesson = profile.lessonNumber - 1

  return (
    <AppShell
      wide
      footer={
        <div className="mx-auto grid w-full max-w-md gap-3">
          {hasNext ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                startOrResumeLesson()
                navigate('/lesson')
              }}
            >
              {t('lesson.next')}
            </button>
          ) : (
            <p className="si text-center text-lg font-bold text-ink">{t('unit.done')}</p>
          )}
          {lastLesson >= 1 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                startLesson(lastLesson)
                navigate('/lesson')
              }}
            >
              {t('lesson.again')}
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={() => navigate('/home')}>
            {t('nav.home')}
          </button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="text-6xl md:text-7xl">🎉</div>
        <h1 className="si text-3xl font-bold text-ink md:text-4xl">
          {hasNext ? t('lesson.done') : t('unit.done')}
        </h1>
        <p className="text-3xl md:text-4xl">⭐⭐⭐⭐⭐</p>
        <p className="si text-lg text-soft md:text-xl">{t('lesson.starsEarned', { n: profile.lastStars || 0 })}</p>
      </div>
    </AppShell>
  )
}
