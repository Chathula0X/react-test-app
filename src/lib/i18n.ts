import si from '../i18n/si.json'
import en from '../i18n/en.json'

export type Lang = 'si' | 'en'

const LANG_KEY = 'parent-lang'
const catalogs: Record<Lang, Record<string, string>> = {
  si: si as Record<string, string>,
  en: en as Record<string, string>,
}

export function getLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'si') return stored
  } catch {
    /* ignore */
  }
  return 'si'
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang)
}

export function t(
  key: string,
  vars: Record<string, string | number> = {},
  lang: Lang = 'si',
) {
  let text = catalogs[lang][key] || catalogs.si[key] || key
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}