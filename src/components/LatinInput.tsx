type LatinInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export default function LatinInput({ value, onChange, autoFocus }: LatinInputProps) {
  return (
    <input
      type="text"
      inputMode={'latin' as 'text'}
      lang="en"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-form-type="other"
      autoFocus={autoFocus}
      ref={(el) => {
        el?.setAttribute('inputmode', 'latin')
      }}
      value={value}
      onChange={(e) => {
        const next = e.target.value.replace(/[^a-zA-Z]/g, '')
        onChange(next)
      }}
      className="en w-full rounded-xl border-2 border-border bg-surface px-3 py-3 text-center text-2xl text-ink outline-none focus:border-primary focus:bg-primary-soft md:py-4 md:text-3xl"
    />
  )
}

export function sameWord(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}
