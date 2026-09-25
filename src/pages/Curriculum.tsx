import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { getCurriculumView } from '../lib/curriculum'
import { getLang, setLang, t, type Lang } from '../lib/i18n'
import type { ItemProgress } from '../types'

type WordStatus = 'known' | 'learning' | 'new'

function wordStatus(
  itemProgress: Record<string, ItemProgress> | undefined,
  wordId: string,
): WordStatus {
  const box = itemProgress?.[wordId]?.box
  if (box === 'known') return 'known'
  if (box === 'learning') return 'learning'
  return 'new'
}

function statusesInView(
  itemProgress: Record<string, ItemProgress> | undefined,
  wordIds: string[],
): Set<WordStatus> {
  const seen = new Set<WordStatus>()
  for (const id of wordIds) seen.add(wordStatus(itemProgress, id))
  return seen
}

function ProgressDot({ status }: { status: WordStatus }) {
  const className =
    status === 'known'
      ? 'h-2 w-2 shrink-0 rounded-full bg-success'
      : status === 'learning'
        ? 'h-2 w-2 shrink-0 rounded-full border border-success bg-[linear-gradient(to_right,var(--color-success)_50%,transparent_50%)]'
        : 'h-2 w-2 shrink-0 rounded-full border border-border bg-surface'

  return <span aria-hidden className={className} />
}

export function Curriculum() {
  const [lang, setLangState] = useState<Lang>(getLang())
  const { ready, profiles } = useApp()
  const [viewingId, setViewingId] = useState<string | null>(null)
  const data = getCurriculumView()

  const viewing = viewingId
    ? profiles.find((p) => p.id === viewingId) ?? null
    : null
  const showPicker = ready && profiles.length > 0
  const overlay = viewing ? viewing.itemProgress : undefined
  const allWordIds = data.unitsLive.flatMap((unit) =>
    unit.lessons.flatMap((lesson) => lesson.words.map((w) => w.id)),
  )
  const shownStatuses = viewing
    ? statusesInView(overlay, allWordIds)
    : new Set<WordStatus>()

  const handleLangChange = (newLang: Lang) => {
    const scrollY = window.scrollY
    setLang(newLang)
    setLangState(newLang)
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    const url = `${window.location.origin}/curriculum`
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-background p-4 text-ink md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/" className="si text-sm text-soft hover:underline">
            ← {t('nav.home', {}, lang)}
          </Link>

          <div className="flex items-center rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => handleLangChange('si')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === 'si' ? 'bg-primary text-white' : 'text-soft hover:text-ink'
              }`}
            >
              සිං
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === 'en' ? 'bg-primary text-white' : 'text-soft hover:text-ink'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {showPicker && (
          <section className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm print:hidden">
            <label htmlFor="progress-child" className="si mb-2 block text-sm font-bold">
              {t('progress.view', {}, lang)}
            </label>
            <select
              id="progress-child"
              value={viewingId ?? ''}
              onChange={(e) => setViewingId(e.target.value || null)}
              className="si w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">{t('progress.pick', {}, lang)}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>

            {viewing && shownStatuses.size > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-soft">
                {shownStatuses.has('known') && (
                  <span className="inline-flex items-center gap-1.5">
                    <ProgressDot status="known" />
                    {t('progress.known', {}, lang)}
                  </span>
                )}
                {shownStatuses.has('learning') && (
                  <span className="inline-flex items-center gap-1.5">
                    <ProgressDot status="learning" />
                    {t('progress.learning', {}, lang)}
                  </span>
                )}
                {shownStatuses.has('new') && (
                  <span className="inline-flex items-center gap-1.5">
                    <ProgressDot status="new" />
                    {t('progress.new', {}, lang)}
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        <header className="mb-6 text-center">
          <h1 className="si text-2xl font-bold md:text-3xl">
            {t('page.title', {}, lang)}
          </h1>
          <p className="si mt-1 text-sm text-soft">
            {t('page.sub', {}, lang)}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium">
              {t('count.units', { n: data.units }, lang)}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium">
              {t('count.lessons', { n: data.lessons }, lang)}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium">
              {t('count.words', { n: data.words }, lang)}
            </span>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="si mb-3 text-base font-bold text-ink">
            {t('howItWorks', {}, lang)}
          </h2>
          <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
            {(
              [
                { icon: '👁️', key: 'how.see' },
                { icon: '🧩', key: 'how.build' },
                { icon: '⌨️', key: 'how.type' },
                { icon: '🔄', key: 'how.review' },
              ] as const
            ).map((step) => (
              <div key={step.key} className="rounded-xl bg-background p-2">
                <span className="block text-lg">{step.icon}</span>
                <span className="font-medium">{t(step.key, {}, lang)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="si mb-3 text-base font-bold text-ink">
            {t('skills', {}, lang)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium"
              >
                {lang === 'si' ? skill.si : skill.en}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-8 space-y-6">
          {data.unitsLive.map((unit) => {
            const unitWords = unit.lessons.flatMap((l) => l.words)
            const knownCount = overlay
              ? unitWords.filter((w) => wordStatus(overlay, w.id) === 'known').length
              : 0

            return (
              <div
                key={unit.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm break-inside-avoid"
              >
                <div className="mb-4 border-b border-border pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-soft">
                      Unit {unit.order}
                    </span>
                    {viewing && (
                      <span className="text-xs font-semibold tabular-nums text-soft">
                        {knownCount} / {unitWords.length}
                      </span>
                    )}
                  </div>
                  <h3 className="si text-lg font-bold">
                    {lang === 'si' ? unit.title_si : unit.title_en}
                  </h3>
                  <p className="si mt-1 text-xs text-soft italic">
                    {lang === 'si' ? unit.outcome_si : unit.outcome_en}
                  </p>
                </div>

                <div className="space-y-4">
                  {unit.lessons.map((lesson) => {
                    const lessonKnown =
                      Boolean(viewing) &&
                      lesson.words.length > 0 &&
                      lesson.words.every((w) => wordStatus(overlay, w.id) === 'known')

                    return (
                      <div
                        key={lesson.id}
                        className="rounded-xl bg-background p-3.5 break-inside-avoid"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="si inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                            {lang === 'si' ? lesson.theme_si : lesson.theme_en}
                            {lessonKnown && (
                              <span aria-label="complete" className="text-success">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-mono text-soft border border-border">
                            {lesson.pattern}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {lesson.words.map((w) => (
                            <span
                              key={w.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs"
                            >
                              {viewing && (
                                <ProgressDot status={wordStatus(overlay, w.id)} />
                              )}
                              <span className="font-medium text-ink">{w.en}</span>
                              <span className="text-soft">•</span>
                              <span className="si text-soft">{w.si}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        {data.comingNext.length > 0 && (
          <section className="mb-8 rounded-2xl border border-dashed border-border p-4">
            <h2 className="si mb-3 text-base font-bold text-soft">
              {t('comingNext', {}, lang)}
            </h2>
            <div className="space-y-2">
              {data.comingNext.map((item, index) => (
                <div key={index} className="si text-xs text-soft">
                  • {lang === 'si' ? item.title_si : item.title_en}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-transform"
          >
            💬 {t('action.share', {}, lang)}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-center text-xs font-semibold text-ink shadow-sm hover:bg-background active:scale-[0.98] transition-transform"
          >
            🖨️ {t('action.print', {}, lang)}
          </button>
        </footer>
      </div>
    </div>
  )
}