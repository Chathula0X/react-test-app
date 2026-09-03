import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Star } from 'lucide-react'
import ChoiceButton from '../components/ChoiceButton'
import { mathsQuestions } from '../data/maths'
import { useStars } from '../hooks/useStars'

function Visual({ question }) {
  if (question.type === 'count') {
    return (
      <p className="text-4xl leading-relaxed sm:text-5xl" aria-hidden="true">
        {Array.from({ length: question.count }, () => question.emoji).join(' ')}
      </p>
    )
  }

  const left = Array.from({ length: question.left }, () => question.emoji).join(' ')
  const right = Array.from({ length: question.right }, () => question.emoji).join(' ')
  const sign = question.type === 'sub' ? '−' : '+'

  return (
    <div className="space-y-2 text-3xl sm:text-4xl" aria-hidden="true">
      <p>{left}</p>
      <p className="font-display text-2xl text-violet-700">
        {sign} {right}
      </p>
    </div>
  )
}

function createQuiz() {
  return {
    index: 0,
    score: 0,
    wrong: new Set(),
    locked: false,
    finished: false,
  }
}

export default function Maths() {
  const { saveMathsScore, progress } = useStars()
  const [quiz, setQuiz] = useState(createQuiz)
  const question = mathsQuestions[quiz.index]
  const isLast = quiz.index === mathsQuestions.length - 1

  function pick(choice) {
    if (quiz.locked || quiz.finished) return

    if (choice === question.answer) {
      const earned = quiz.wrong.size === 0 ? 1 : 0
      const nextScore = quiz.score + earned
      setQuiz({
        ...quiz,
        locked: true,
        score: nextScore,
      })
    } else {
      const wrong = new Set(quiz.wrong)
      wrong.add(choice)
      setQuiz({ ...quiz, wrong })
    }
  }

  function next() {
    if (isLast) {
      saveMathsScore(quiz.score)
      setQuiz({ ...quiz, finished: true })
      return
    }
    setQuiz({
      index: quiz.index + 1,
      score: quiz.score,
      wrong: new Set(),
      locked: false,
      finished: false,
    })
  }

  function restart() {
    setQuiz(createQuiz())
  }

  if (quiz.finished) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-6xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-3 font-display text-4xl text-violet-950">Great work!</h1>
        <p className="mt-3 text-xl font-extrabold text-amber-700">
          You earned {quiz.score} of {mathsQuestions.length} stars
        </p>
        <p className="mt-1 font-semibold text-violet-800/80">
          Best so far: {Math.max(progress.mathsBest, quiz.score)} stars
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-5 font-extrabold text-amber-950"
          >
            <RotateCcw size={18} />
            Play again
          </button>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center rounded-full bg-violet-600 px-5 font-extrabold text-white"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="font-extrabold text-amber-700">
        Question {quiz.index + 1} of {mathsQuestions.length}
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${((quiz.index + (quiz.locked ? 1 : 0)) / mathsQuestions.length) * 100}%` }}
        />
      </div>

      <h1 className="mt-6 font-display text-3xl text-violet-950">{question.prompt}</h1>
      <div className="mt-5 rounded-3xl bg-white p-6 shadow-md">
        <Visual question={question} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
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
            {quiz.wrong.size === 0 ? 'Yes! You got a star ⭐' : 'That’s it. Next one!'}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 min-h-12 rounded-full bg-violet-600 px-6 font-extrabold text-white"
          >
            {isLast ? 'See my stars' : 'Next question'}
          </button>
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center gap-1 font-bold text-violet-700">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          Stars this round: {quiz.score}
        </p>
      )}
    </div>
  )
}
