import { playFile } from '../lib/audio'

export default function SpeakerButton({ src }: { src?: string }) {
  return (
    <button
      type="button"
      onClick={() => playFile(src)}
      className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-lg text-primary"
    >
      🔊
    </button>
  )
}
