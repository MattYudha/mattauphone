import { withBasePath } from '@/lib/base-path'

export type SoundId = 'kakao' | 'ringtone' | 'yhCall'

const SOURCES: Record<SoundId, string> = {
  kakao: '/sounds/kakao.mp3',
  ringtone: '/sounds/ringtone.mp3',
  yhCall: '/sounds/yh-call.mp3',
}

const cache: Partial<Record<SoundId, HTMLAudioElement>> = {}
// play() resolves asynchronously, so a stop can arrive before playback actually starts.
// This flag records whether each sound should currently be audible.
const wanted: Partial<Record<SoundId, boolean>> = {}
let unlocked = false

function get(id: SoundId): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  let audio = cache[id]
  if (!audio) {
    audio = new Audio(withBasePath(SOURCES[id]))
    audio.preload = 'auto'
    cache[id] = audio
  }
  return audio
}

/**
 * iOS Safari only lets an <audio> element play later if it was first started inside a user gesture,
 * so every sound is briefly played muted on the first tap.
 */
export function unlockSounds() {
  if (unlocked || typeof window === 'undefined') return
  unlocked = true
  for (const id of Object.keys(SOURCES) as SoundId[]) {
    if (wanted[id]) continue
    const audio = get(id)
    if (!audio) continue
    audio.muted = true
    audio
      .play()
      .then(() => {
        if (wanted[id]) return
        audio.pause()
        audio.currentTime = 0
      })
      .catch(() => {})
      .finally(() => {
        audio.muted = false
      })
  }
}

export function playSound(id: SoundId, { loop = false }: { loop?: boolean } = {}) {
  const audio = get(id)
  if (!audio) return
  wanted[id] = true
  audio.loop = loop
  audio.muted = false
  audio.currentTime = 0
  audio
    .play()
    .then(() => {
      if (!wanted[id]) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    .catch(() => {
      // Autoplay can still be blocked (no prior gesture); the story continues silently.
    })
}

export function stopSound(id: SoundId) {
  wanted[id] = false
  const audio = cache[id]
  if (!audio) return
  audio.loop = false
  audio.pause()
  audio.currentTime = 0
}
