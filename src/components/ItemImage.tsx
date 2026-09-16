import { useState } from 'react'
import type { Item } from '../types'

type ItemImageProps = {
  item: Item
  size?: 'sm' | 'lg'
}

export default function ItemImage({ item, size = 'lg' }: ItemImageProps) {
  const [broken, setBroken] = useState(false)
  const showImage = !broken && Boolean(item.image)

  if (size === 'sm') {
    return (
      <span className="grid h-full min-h-0 w-full min-w-0 place-items-center">
        {showImage ? (
          <img
            src={item.image}
            alt=""
            onError={() => setBroken(true)}
            className="h-full w-full max-h-full max-w-full object-contain object-center"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-4xl md:text-5xl">
            {item.emoji || '🖼️'}
          </span>
        )}
      </span>
    )
  }

  const box = 'h-28 w-28 text-5xl md:h-36 md:w-36 md:text-6xl'

  if (showImage) {
    return (
      <img
        src={item.image}
        alt=""
        onError={() => setBroken(true)}
        className={`${box} rounded-2xl object-contain bg-primary-soft mx-auto`}
      />
    )
  }

  return (
    <div className={`${box} rounded-2xl bg-primary-soft grid place-items-center mx-auto`}>
      {item.emoji || '🖼️'}
    </div>
  )
}
