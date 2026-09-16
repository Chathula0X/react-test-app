import si from '../i18n/si.json'

const strings = si as Record<string, string>

export function t(key: string, vars: Record<string, string | number> = {}) {
  let text = strings[key] || key
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}
