import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import ChoiceButton from '../components/ChoiceButton'
import { getScienceTopic } from '../data/science'
import { useStars } from '../hooks/useStars'

function createQuiz() {
  return {
    started: false,
    index: 0,
    score: 0,
    wrong: new Set(),
    locked: false,
    finished: false,
  }
}

export default function ScienceTopic() {
  const { id } = useParams()
  const topic = getScienceTopic(id)
  const { saveScienceScore, getScienceBest } = useStars()
  const [quiz, setQuiz] = useState(createQuiz)

  if (!topic) {
    return <Navigate to="/science" replace />
  }

  const question = topic.quiz[quiz.index]
  const isLast = quiz.index === topic.quiz.length - 1

  function pick(choice) {
    if (quiz.locked || quiz.finished) return
    if (choice === question.answer) {
      const earned = quiz.wrong.size === 0 ? 1 : 0
      setQuiz({
        ...quiz,
        locked: true,
        score: quiz.score + earned,
      })
    } else {
      const wrong = new Set(quiz.wrong)
      wrong.add(choice)
      setQuiz({ ...quiz, wrong })
    }
  }

  function next() {
    if (isLast) {
      saveScienceScore(topic.id, quiz.score)
      setQuiz({ ...quiz, finished: true })
      return
    }
    setQuiz({
      ...quiz,
      index: quiz.index + 1,
      wrong: new Set(),
      locked: false,
    })
  }

  if (quiz.finished) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-6xl" aria-hidden="true">
          {topic.emoji}
        </p>
        <h1 className="mt-3 font-display text-4xl text-violet-950">Quiz complete!</h1>
        <p className="mt-3 text-xl font-extrabold text-amber-700">
          You earned {quiz.score} of {topic.quiz.length} stars
        </p>
        <p className="mt-1 font-semibold text-violet-800/80">
          Best so far: {Math.max(getScienceBest(topic.id), quiz.score)} stars
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setQuiz(createQuiz())}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-5 font-extrabold text-emerald-950"
          >
            <RotateCcw size={18} />
            Try again
          </button>
          <Link
            to="/science"
            className="inline-flex min-h-12 items-center rounded-full bg-violet-600 px-5 font-extrabold text-white"
          >
            More science
          </Link>
        </div>
      </div>
    )
  }

  if (!quiz.started) {
    return (
      <article className="mx-auto max-w-2xl">
        <p className="text-5xl" aria-hidden="true">
          {topic.emoji}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-violet-950 sm:text-4xl">
          {topic.title}
        </h1>
        <ul className="mt-6 space-y-3 rounded-3xl bg-white p-6 text-left shadow-md">
          {topic.facts.map((fact) => (
            <li key={fact} className="text-xl font-bold leading-relaxed text-slate-800">
              {fact}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setQuiz({ ...createQuiz(), started: true })}
          className="mt-6 min-h-12 rounded-full bg-emerald-500 px-6 font-extrabold text-white"
        >
          Start the quiz
        </button>
      </article>
    )
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="font-extrabold text-emerald-700">
        {topic.title} · {quiz.index + 1} of {topic.quiz.length}
      </p>
      <h1 className="mt-4 font-display text-3xl text-violet-950">{question.question}</h1>
      <div className="mt-5 grid gap-3">
        {question.choices.map((choice) => {
          let state = 'idle'
          if (quiz.locked && choice === question.answer) state = 'correct'
          else if (quiz.wrong.has(choice)) state = 'wrong'
          return (
            <ChoiceButton
              key={choice}
              state={state}
              disabled={quiz.locked}
              onClick={() => pick(choice)}
            >
              {choice}
            </ChoiceButton>
          )
        })}
      </div>
      {quiz.wrong.size > 0 && !quiz.locked ? (
        <p className="mt-4 font-extrabold text-rose-600" role="status">
          Try again!
        </p>
      ) : null}
      {quiz.locked ? (
        <div className="mt-5">
          <p className="font-extrabold text-emerald-700" role="status">
            {quiz.wrong.size === 0 ? 'Yes! You got a star ⭐' : 'That’s the one.'}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 min-h-12 rounded-full bg-violet-600 px-6 font-extrabold text-white"
          >
            {isLast ? 'See my stars' : 'Next question'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
