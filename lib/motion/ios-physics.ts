/** Fisika gerak bergaya iOS: preset spring, proyeksi inersia, rubber band, dan interpolasi. */

export type Spring = { type: 'spring'; stiffness: number; damping: number; mass: number; restDelta: number; restSpeed: number }

/** Parameter SwiftUI (response, dampingFraction) → spring Motion dengan mass 1. */
export function iosSpring(response: number, dampingFraction: number): Spring {
  return {
    type: 'spring',
    stiffness: (2 * Math.PI / response) ** 2,
    damping: (4 * Math.PI * dampingFraction) / response,
    mass: 1,
    restDelta: 0.0005,
    restSpeed: 0.01,
  }
}

export const SPRING = {
  /** Kartu app → ikon di layar utama */
  appClose: iosSpring(0.42, 0.86),
  /** Ikon → app layar penuh */
  appOpen: iosSpring(0.5, 0.86),
  /** Gesture dibatalkan, kembali ke posisi semula */
  snapBack: iosSpring(0.35, 0.9),
  /** Kartu App Switcher mengendap / snap ke kartu terdekat */
  switcher: iosSpring(0.4, 0.92),
  /** Kartu dilempar ke atas untuk menutup app */
  throwOut: iosSpring(0.3, 1),
}

/** Posisi akhir yang diproyeksikan dari velocity (rumus deceleration UIScrollView, rate 0.998). */
export const project = (velocityPxPerSec: number, rate = 0.998) => ((velocityPxPerSec / 1000) * rate) / (1 - rate)

/** Rubber band ala iOS: makin jauh ditarik, makin berat. */
export const rubberband = (overshoot: number, dimension: number, c = 0.55) =>
  Math.sign(overshoot) * (1 - 1 / ((Math.abs(overshoot) * c) / dimension + 1)) * dimension

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = clamp((v - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Interpolasi linear per segmen, nilai di luar rentang ditahan di ujung. */
export function interpolate(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0]
  for (let i = 1; i < input.length; i++) {
    if (v <= input[i]) return lerp(output[i - 1], output[i], (v - input[i - 1]) / (input[i] - input[i - 1]))
  }
  return output[output.length - 1]
}

/** Velocity pointer yang stabil dari sampel 100 ms terakhir. */
export function createVelocityTracker(windowMs = 100) {
  const samples: { t: number; x: number; y: number }[] = []
  return {
    add(x: number, y: number, t = performance.now()) {
      samples.push({ t, x, y })
      while (samples.length > 2 && t - samples[0].t > windowMs) samples.shift()
    },
    get() {
      if (samples.length < 2) return { vx: 0, vy: 0 }
      const a = samples[0]
      const b = samples[samples.length - 1]
      // Pointer yang diam lebih dari satu jendela berarti velocity nol, bukan sisa gerakan lama.
      if (performance.now() - b.t > windowMs) return { vx: 0, vy: 0 }
      const dt = Math.max((b.t - a.t) / 1000, 0.001)
      return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt }
    },
    reset() {
      samples.length = 0
    },
  }
}
