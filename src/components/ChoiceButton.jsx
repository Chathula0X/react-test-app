export default function ChoiceButton({
  children,
  onClick,
  disabled,
  state = 'idle',
}) {
  const styles = {
    idle: 'bg-white text-slate-800 hover:scale-[1.02] hover:border-violet-300',
    correct: 'bg-emerald-100 border-emerald-400 text-emerald-900',
    wrong: 'bg-rose-100 border-rose-400 text-rose-900',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-16 rounded-2xl border-4 px-4 py-3 text-xl font-extrabold shadow-sm transition disabled:cursor-not-allowed ${styles[state]}`}
    >
      {children}
    </button>
  )
}
