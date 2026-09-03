import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { scienceTopics } from '../data/science'
import { useStars } from '../hooks/useStars'

export default function Science() {
  const { getScienceBest } = useStars()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-violet-950 sm:text-4xl">
        Simple science
      </h1>
      <p className="mt-2 font-semibold text-violet-800/80">
        Read a short story, then try a tiny quiz.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {scienceTopics.map((topic, index) => {
          const best = getScienceBest(topic.id)
          return (
            <motion.li
              key={topic.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                to={`/science/${topic.id}`}
                className={`block h-full rounded-3xl bg-gradient-to-br p-5 shadow-md ${topic.color}`}
              >
                <span className="grid size-16 place-items-center rounded-2xl bg-white/80 text-4xl">
                  {topic.emoji}
                </span>
                <h2 className="mt-4 font-display text-2xl text-violet-950">{topic.title}</h2>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-sm font-bold text-violet-700">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {best}/{topic.quiz.length} stars
                </p>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
