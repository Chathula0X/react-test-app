import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { poems } from '../data/poems'
import { useStars } from '../hooks/useStars'

export default function Poems() {
  const { hasReadPoem } = useStars()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-violet-950 sm:text-4xl">
        English poems
      </h1>
      <p className="mt-2 font-semibold text-violet-800/80">
        Tap a rhyme, read it, then press Read aloud.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {poems.map((poem, index) => {
          const read = hasReadPoem(poem.id)
          return (
            <motion.li
              key={poem.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/poems/${poem.id}`}
                className="flex h-full items-start gap-4 rounded-3xl bg-white p-5 shadow-md ring-2 ring-rose-100 transition hover:ring-rose-300"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-rose-100 text-4xl">
                  {poem.emoji}
                </span>
                <span className="min-w-0 text-left">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-xl text-violet-950">
                      {poem.title}
                    </span>
                    {read ? (
                      <Star
                        size={18}
                        className="fill-amber-400 text-amber-400"
                        aria-label="Star earned"
                      />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-rose-600">
                    {poem.level} · {poem.lines.length} lines
                  </span>
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
