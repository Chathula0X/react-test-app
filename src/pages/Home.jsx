import { motion } from 'framer-motion'
import { BookOpen, Calculator, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mathsQuestions } from '../data/maths'
import { poems } from '../data/poems'
import { scienceTopics } from '../data/science'
import { useStars } from '../hooks/useStars'
import { useAuth } from '../hooks/useAuth'

const subjects = [
  {
    to: '/poems',
    title: 'Poems',
    blurb: 'Read rhymes out loud',
    emoji: '📖',
    icon: BookOpen,
    tint: 'from-rose-200 to-pink-100',
    ring: 'hover:ring-rose-300',
    progressKey: 'poems',
  },
  {
    to: '/maths',
    title: 'Maths',
    blurb: 'Count, add, and subtract',
    emoji: '🔢',
    icon: Calculator,
    tint: 'from-amber-200 to-yellow-100',
    ring: 'hover:ring-amber-300',
    progressKey: 'maths',
  },
  {
    to: '/science',
    title: 'Science',
    blurb: 'Plants, animals, and weather',
    emoji: '🔬',
    icon: Leaf,
    tint: 'from-emerald-200 to-teal-100',
    ring: 'hover:ring-emerald-300',
    progressKey: 'science',
  },
]

export default function Home() {
  const { user } = useAuth()
  const { poemStars, progress, scienceStars } = useStars()
  const scienceMax = scienceTopics.reduce((sum, topic) => sum + topic.quiz.length, 0)

  const progressLabel = {
    poems: `${poemStars}/${poems.length} poems`,
    maths: `${progress.mathsBest}/${mathsQuestions.length} correct`,
    science: `${scienceStars}/${scienceMax} stars`,
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-5xl" aria-hidden="true">
        🌈
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-violet-950 sm:text-5xl">
        Hi, {user?.name || 'little learner'}!
      </h1>
      <p className="mt-3 max-w-lg text-lg font-semibold text-violet-800/80">
        What shall we do today? Pick a card and earn stars.
      </p>

      <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
        {subjects.map((subject, index) => {
          const Icon = subject.icon
          return (
            <motion.div
              key={subject.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={subject.to}
                className={`block h-full rounded-3xl bg-gradient-to-br p-5 shadow-md ring-4 ring-transparent transition ${subject.tint} ${subject.ring}`}
              >
                <span className="grid size-16 place-items-center rounded-2xl bg-white/80 text-4xl shadow-sm">
                  {subject.emoji}
                </span>
                <h2 className="mt-4 flex items-center justify-center gap-2 font-display text-2xl text-violet-950">
                  <Icon size={22} />
                  {subject.title}
                </h2>
                <p className="mt-1 font-semibold text-violet-800/80">{subject.blurb}</p>
                <p className="mt-4 rounded-full bg-white/70 px-3 py-1 text-sm font-bold text-violet-700">
                  {progressLabel[subject.progressKey]}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
