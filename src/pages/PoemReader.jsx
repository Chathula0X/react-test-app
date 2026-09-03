import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Star, Volume2, VolumeX } from 'lucide-react'
import { getPoem } from '../data/poems'
import { useStars } from '../hooks/useStars'

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export default function PoemReader() {
  const { id } = useParams()
  const poem = getPoem(id)
  const { hasReadPoem, markPoemRead } = useStars()
  const [activeLine, setActiveLine] = useState(-1)
  const [speaking, setSpeaking] = useState(false)
  const [justEarned, setJustEarned] = useState(false)

  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  if (!poem) {
    return <Navigate to="/poems" replace />
  }

  const alreadyRead = hasReadPoem(poem.id)

  function readAloud() {
    if (!window.speechSynthesis) return
    stopSpeaking()
    setSpeaking(true)
    setActiveLine(0)

    poem.lines.forEach((line, index) => {
      const utterance = new SpeechSynthesisUtterance(line)
      utterance.rate = 0.85
      utterance.pitch = 1.15
      utterance.onstart = () => setActiveLine(index)
      utterance.onend = () => {
        if (index === poem.lines.length - 1) {
          setSpeaking(false)
          setActiveLine(-1)
        }
      }
      window.speechSynthesis.speak(utterance)
    })
  }

  function stop() {
    stopSpeaking()
    setSpeaking(false)
    setActiveLine(-1)
  }

  function earnStar() {
    if (alreadyRead) return
    markPoemRead(poem.id)
    setJustEarned(true)
  }

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-5xl" aria-hidden="true">
        {poem.emoji}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-violet-950 sm:text-4xl">
        {poem.title}
      </h1>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {speaking ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-rose-500 px-5 font-extrabold text-white shadow-sm"
          >
            <VolumeX size={20} />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={readAloud}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-600 px-5 font-extrabold text-white shadow-sm hover:bg-violet-700"
          >
            <Volume2 size={20} />
            Read aloud
          </button>
        )}
        <button
          type="button"
          onClick={earnStar}
          disabled={alreadyRead}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-5 font-extrabold text-amber-950 shadow-sm disabled:cursor-default disabled:opacity-80"
        >
          <Star size={20} className={alreadyRead ? 'fill-amber-700' : ''} />
          {alreadyRead ? 'Star earned!' : 'I read this!'}
        </button>
      </div>

      {justEarned ? (
        <p className="mt-3 font-extrabold text-amber-700" role="status">
          You earned a star! ⭐
        </p>
      ) : null}

      <ol className="mt-6 space-y-3 rounded-3xl bg-white p-6 text-left shadow-md">
        {poem.lines.map((line, index) => (
          <li
            key={index}
            className={`rounded-2xl px-4 py-3 text-xl font-bold leading-relaxed transition ${
              activeLine === index
                ? 'bg-amber-100 text-violet-950 ring-2 ring-amber-300'
                : 'text-slate-800'
            }`}
          >
            {line}
          </li>
        ))}
      </ol>

      <p className="mt-6">
        <Link
          to="/poems"
          className="font-extrabold text-violet-700 underline decoration-2 underline-offset-4"
        >
          More poems
        </Link>
      </p>
    </article>
  )
}
