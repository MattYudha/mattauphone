import { withBasePath } from '@/lib/base-path'

export type SoundId = 'kakao' | 'ringtone' | 'yhCall' | 'dialing' | 'yhOutgoing'

const SOURCES: Record<SoundId, string> = {
  kakao: '/sounds/kakao.mp3',
  ringtone: '/sounds/ringtone.mp3',
  yhCall: '/sounds/yh-call.mp3',
  dialing: '/sounds/dialing.mp3',
  yhOutgoing: '/sounds/yh-outgoing.mp3',
}

type AudioStore = {
  cache: Partial<Record<SoundId, HTMLAudioElement>>
  // play() resolves asynchronously, so a stop can arrive before playback actually starts.
  // This flag records whether each sound should currently be audible.
  wanted: Partial<Record<SoundId, boolean>>
}

// Kept on globalThis so a hot reload of this module reuses (and can stop) audio that is
// already playing, instead of orphaning a looping ringtone nothing can reach.
const store: AudioStore = ((globalThis as { __storyAudio?: AudioStore }).__storyAudio ??= {
  cache: {},
  wanted: {},
})
const { cache, wanted } = store
for (const audio of Object.values(cache)) {
  audio?.pause()
}
for (const id of Object.keys(wanted) as SoundId[]) wanted[id] = false
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

export function playSound(
  id: SoundId,
  { loop = false, onEnded }: { loop?: boolean; onEnded?: () => void } = {},
) {
  const audio = get(id)
  if (!audio) return
  wanted[id] = true
  audio.loop = loop
  audio.onended = onEnded
    ? () => {
        if (wanted[id]) onEnded()
      }
    : null
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

/** Briefly plays a sound muted inside a tap so it can be started later without a gesture. */
export function primeSound(id: SoundId) {
  const audio = get(id)
  if (!audio || wanted[id]) return
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

export function stopSound(id: SoundId) {
  wanted[id] = false
  const audio = cache[id]
  if (!audio) return
  audio.onended = null
  audio.loop = false
  audio.pause()
  audio.currentTime = 0
}

/* ------------------------------------------------------------------ */
/* Klik keyboard: disintesis dengan Web Audio, tanpa file audio        */
/* ------------------------------------------------------------------ */

let keyCtx: AudioContext | null = null
let keyNoise: AudioBuffer | null = null

function keyContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  keyCtx ??= new Ctor()
  if (!keyNoise) {
    // Derau pendek yang meluruh cepat terdengar seperti "tik" keyboard iOS.
    const length = Math.floor(keyCtx.sampleRate * 0.025)
    keyNoise = keyCtx.createBuffer(1, length, keyCtx.sampleRate)
    const data = keyNoise.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 4
  }
  return keyCtx
}

/** Bunyi klik satu tombol keyboard. `kind` membedakan tombol huruf dan tombol khusus (spasi, hapus). */
export function playKeyClick(kind: 'letter' | 'special' = 'letter') {
  const ctx = keyContext()
  if (!ctx || !keyNoise) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const source = ctx.createBufferSource()
  source.buffer = keyNoise
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = kind === 'letter' ? 3200 : 2100
  filter.Q.value = 0.9
  const gain = ctx.createGain()
  gain.gain.value = kind === 'letter' ? 0.32 : 0.4
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
}
