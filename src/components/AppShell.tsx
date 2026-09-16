import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export default function AppShell({ children, footer, wide = false }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className={`app-frame ${wide ? 'app-frame-wide' : ''}`}>
        <div className="app-frame-body">{children}</div>
        {footer ? <div className="app-frame-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
