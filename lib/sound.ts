import { withBasePath } from '@/lib/base-path'

export type SoundId = 'kakao' | 'ringtone' | 'yhCall'

const SOURCES: Record<SoundId, string> = {
  kakao: '/sounds/kakao.mp3',
  ringtone: '/sounds/ringtone.mp3',
  yhCall: '/sounds/yh-call.mp3',
}

const cache: Partial<Record<SoundId, HTMLAudioElement>> = {}
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
    const audio = get(id)
    if (!audio) continue
    audio.muted = true
    audio
      .play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.muted = false
      })
      .catch(() => {
        audio.muted = false
      })
  }
}

export function playSound(id: SoundId, { loop = false }: { loop?: boolean } = {}) {
  const audio = get(id)
  if (!audio) return
  audio.loop = loop
  audio.muted = false
  audio.currentTime = 0
  audio.play().catch(() => {
    // Autoplay can still be blocked (no prior gesture); the story continues silently.
  })
}

export function stopSound(id: SoundId) {
  const audio = cache[id]
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  audio.loop = false
}
