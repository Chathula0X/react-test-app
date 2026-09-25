const KEY = 'll-mic'

export type MicSession = 'unknown' | 'granted' | 'denied'

export function getMicSession(): MicSession {
  try {
    const value = sessionStorage.getItem(KEY)
    if (value === 'granted' || value === 'denied') return value
  } catch {
    /* private mode or tests */
  }
  return 'unknown'
}

export function setMicSession(value: 'granted' | 'denied') {
  try {
    sessionStorage.setItem(KEY, value)
  } catch {
    /* private mode or tests */
  }
}

export async function askMic(): Promise<MicSession> {
  const existing = getMicSession()
  if (existing !== 'unknown') return existing
  if (!navigator.mediaDevices?.getUserMedia) {
    setMicSession('denied')
    return 'denied'
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    setMicSession('granted')
    return 'granted'
  } catch {
    setMicSession('denied')
    return 'denied'
  }
}