import { useMemo, useState } from 'react'
import ItemImage from '../components/ItemImage'
import { t } from '../lib/i18n'
import { mulberry32, shuffle } from '../lib/rng'
import { playTone } from '../lib/audio'
import type { Item, StepResult } from '../types'

type Tile = { id: string; ch: string; decoy?: boolean }

function tilesFor(item: Item, seed: number) {
  const letters: Tile[] = item.en.split('').map((ch, i) => ({ id: `l${i}`, ch }))
  const decoys: Tile[] = (item.distractors.letters || []).slice(0, 2).map((ch, i) => ({
    id: `d${i}`,
    ch,
    decoy: true,
  }))
  return shuffle([...letters, ...decoys], mulberry32(seed))
}

type WordBuildProps = {
  item: Item
  seed: number
  onResult: (result: StepResult) => void
}

export default function WordBuild({ item, seed, onResult }: WordBuildProps) {
  const start = useMemo(() => tilesFor(item, seed), [item, seed])
  const [pool, setPool] = useState(start)
  const [placed, setPlaced] = useState<Tile[]>([])
  const [wrongOnSlot, setWrongOnSlot] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const nextCh = item.en[placed.length]

  function tapPool(tile: Tile) {
    if (tile.ch !== nextCh) {
      setShake(true)
      playTone(false)
      const count = wrongOnSlot + 1
      setWrongOnSlot(count)
      if (count >= 3) setHint(nextCh)
      setTimeout(() => setShake(false), 350)
      return
    }
    const nextPlaced = [...placed, tile]
    setPlaced(nextPlaced)
    setPool(pool.filter((x) => x.id !== tile.id))
    setWrongOnSlot(0)
    setHint(null)
    if (nextPlaced.length === item.en.length) {
      window.setTimeout(() => onResult({ correct: true, rescued: wrongOnSlot >= 3 }), 500)
      playTone(true)
    }
  }

  function tapPlaced(tile: Tile) {
    setPlaced(placed.filter((x) => x.id !== tile.id))
    setPool([...pool, tile])
  }

  return (
    <div className={`flex flex-1 flex-col items-center gap-4 ${shake ? 'shake' : ''}`}>
      <p className="si text-muted">{t('step.arrangeLetters')}</p>
      <ItemImage item={item} />
      <div className="flex gap-2">
        {item.en.split('').map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => placed[i] && tapPlaced(placed[i])}
            className="en grid h-12 w-10 place-items-center border-b-4 border-primary text-xl text-ink md:h-14 md:w-12 md:text-2xl"
          >
            {placed[i]?.ch || ''}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => tapPool(tile)}
            className={`en grid h-12 min-w-12 place-items-center rounded-lg border-2 text-xl md:h-14 md:min-w-14 md:text-2xl ${
              hint === tile.ch
                ? 'border-success bg-success-soft text-ink'
                : 'border-border bg-surface text-ink hover:border-border-interactive hover:bg-primary-soft'
            }`}
          >
            {tile.ch}
          </button>
        ))}
      </div>
    </div>
  )
}
