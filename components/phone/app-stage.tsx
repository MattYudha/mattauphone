'use client'

import {
  Activity,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { animate, motionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from 'motion/react'
import { useStory, type AppId, type Screen } from '@/lib/story/store'
import { AppPresenceProvider } from '@/lib/story/app-presence'
import {
  SPRING,
  clamp,
  createVelocityTracker,
  interpolate,
  lerp,
  project,
  rubberband,
  smoothstep,
  type Spring,
} from '@/lib/motion/ios-physics'
import { withBasePath } from '@/lib/base-path'
import { AppGlyph } from './app-icons'
import { APP_LABEL } from './app-meta'
import { HomeScreen } from './home-screen'

/* ------------------------------------------------------------------ */
/* Pose: posisi kartu relatif terhadap pusat layar                     */
/* ------------------------------------------------------------------ */

/** x,y = geser pusat kartu (px), s = skala, r = radius sudut visual (px), c = potong ke persegi (0..1), o = opacity */
type Pose = { x: number; y: number; s: number; r: number; c: number; o: number }

const FULL: Pose = { x: 0, y: 0, s: 1, r: 0, c: 0, o: 1 }
const DEVICE_RADIUS = 48
const SWITCHER_SCALE = 0.6
/** Jarak antarkartu di App Switcher, relatif terhadap lebar layar */
const CARD_GAP = 0.42
const HOME_BAR_ZONE = 34

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  s: lerp(a.s, b.s, t),
  r: lerp(a.r, b.r, t),
  c: lerp(a.c, b.c, t),
  o: lerp(a.o, b.o, t),
})

/** Kartu app yang mengikuti jari: tepi bawah kartu tetap di bawah jari, makin tinggi makin kecil. */
function dragPose(dx: number, dy: number, H: number): Pose {
  const p = clamp(-dy / H, 0, 1)
  const s = interpolate(p, [0, 0.4, 1], [1, 0.56, 0.46])
  return { x: dx, y: (H / 2) * (1 - s) + dy, s, r: DEVICE_RADIUS * s * clamp(p / 0.02), c: 0, o: 1 }
}

/** Posisi kartu di App Switcher. rel > 0 = app lebih lama (kiri, bertumpuk rapat), rel < 0 = lebih baru (kanan). */
function switcherPose(rel: number, W: number, H: number): Pose {
  const x = rel >= 0 ? -rel * W * CARD_GAP : -rel * W * 0.95
  return { x, y: -H * 0.02, s: SWITCHER_SCALE, r: 34, c: 0, o: clamp(4.2 - rel) }
}

type Rect = { cx: number; cy: number; w: number }

function iconPose(rect: Rect, W: number, H: number): Pose {
  return { x: rect.cx - W / 2, y: rect.cy - H / 2, s: rect.w / W, r: rect.w * 0.225, c: 1, o: 1 }
}

const centerPose = (H: number): Pose => ({ x: 0, y: H * 0.04, s: 0.9, r: 34, c: 0, o: 0 })

/* ------------------------------------------------------------------ */
/* State tampilan                                                      */
/* ------------------------------------------------------------------ */

type Phase =
  | 'idle'
  | 'drag' // kartu app aktif diseret dari home bar
  | 'homeDrag' // home bar diseret di layar utama
  | 'toSwitcher'
  | 'switcher'
  | 'flyHome' // kartu terbang kembali ke ikonnya
  | 'opening' // app membesar dari ikon / tengah
  | 'cardOpening' // kartu di App Switcher dibuka
  | 'switcherToHome'
  | 'unlocking'

type View = {
  screen: Screen
  phase: Phase
  /** App yang sedang dianimasikan / dipegang */
  app: AppId | null
  /** Urutan kartu App Switcher (terbaru di depan), dibekukan selama App Switcher terbuka */
  order: AppId[]
  armed: boolean
  /** Perubahan layar yang dipicu stage sendiri, supaya tidak dianimasikan dua kali */
  expect: Screen | null
  origin: 'icon' | 'center'
  token: number
}

const sameScreen = (a: Screen | null, b: Screen) =>
  !!a && a.kind === b.kind && (a.kind !== 'app' || (b.kind === 'app' && a.app === b.app))

const SWITCHER_PHASES: Phase[] = ['toSwitcher', 'switcher', 'cardOpening', 'switcherToHome']

/** Transisi otomatis saat layar berubah dari luar stage (tombol, banner, notifikasi, dll.). */
function deriveTransition(prev: View, screen: Screen): View {
  const base = { ...prev, screen, expect: null }
  if (sameScreen(prev.expect, screen)) return base
  const from = prev.screen
  const bump = (patch: Partial<View>): View => ({ ...base, ...patch, token: prev.token + 1 })
  switch (screen.kind) {
    case 'app': {
      if (from.kind === 'app' && from.app === screen.app) return base
      return bump({ phase: 'opening', app: screen.app, origin: from.kind === 'home' ? 'icon' : 'center', armed: false })
    }
    case 'home': {
      if (from.kind === 'app') return bump({ phase: 'flyHome', app: from.app, armed: false })
      if (from.kind === 'lock' || from.kind === 'passcode') return bump({ phase: 'unlocking', app: null, armed: false })
      if (from.kind === 'switcher') return bump({ phase: 'switcherToHome', armed: false })
      return bump({ phase: 'idle', app: null, armed: false })
    }
    case 'switcher':
      return bump({ phase: 'switcher', armed: false })
    default:
      return bump({ phase: 'idle', app: null, armed: false, order: [] })
  }
}

/* ------------------------------------------------------------------ */
/* Context untuk HomeIndicator, TopNav, dan ikon layar utama           */
/* ------------------------------------------------------------------ */

type HomeBarSurface = 'app' | 'home'

type HomeBarHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void
  onClick: (e: React.MouseEvent<HTMLElement>) => void
}

type StageContext = {
  phase: Phase
  homeBar: (surface: HomeBarSurface, onTap: () => void) => HomeBarHandlers
  registerIcon: (app: AppId, el: HTMLElement | null) => void
}

const StageCtx = createContext<StageContext | null>(null)
const SurfaceCtx = createContext<HomeBarSurface | null>(null)

export function useStage() {
  return useContext(StageCtx)
}

/** Home bar di dalam app / layar utama memakai gesture; di layar kunci & kode sandi hanya tombol biasa. */
export function useHomeBarHandlers(onTap: () => void): HomeBarHandlers | null {
  const stage = useContext(StageCtx)
  const surface = useContext(SurfaceCtx)
  if (!stage || !surface) return null
  return stage.homeBar(surface, onTap)
}

/* ------------------------------------------------------------------ */
/* Stage                                                               */
/* ------------------------------------------------------------------ */

type Gesture = {
  kind: 'bar' | 'switcher'
  surface: HomeBarSurface | null
  onTap: (() => void) | null
  pointerId: number
  startX: number
  startY: number
  baseX: number
  baseY: number
  t0: number
  moved: boolean
  axis: 'x' | 'y' | null
  card: AppId | null
  scroll0: number
  onBar: boolean
}

export function AppStage({ apps, children }: { apps: Record<AppId, () => React.ReactNode>; children: React.ReactNode }) {
  const story = useStory()
  const { screen, recentApps } = story
  // Handler gesture hidup lebih lama dari satu render, jadi data store dibaca lewat ref agar tidak basi.
  const storeRef = useRef(story)
  storeRef.current = story
  const openApp = (app: AppId) => storeRef.current.openApp(app)
  const goHome = () => storeRef.current.goHome()
  const openSwitcher = () => storeRef.current.openSwitcher()
  const closeRecentApp = (app: AppId) => storeRef.current.closeRecentApp(app)
  const reduceMotion = useReducedMotion()

  const [view, setView] = useState<View>(() => ({
    screen,
    phase: 'idle',
    app: screen.kind === 'app' ? screen.app : null,
    order: [],
    armed: false,
    expect: null,
    origin: 'center',
    token: 0,
  }))
  // Menyesuaikan state saat layar berubah, langsung di fase render supaya tidak ada satu frame yang salah tampil.
  let current = view
  if (view.screen !== screen) {
    current = deriveTransition(view, screen)
    setView(current)
  }
  const viewRef = useRef(current)
  viewRef.current = current

  /* ---------- motion value: semua animasi per-frame lewat sini ---------- */
  const mv = useMemo(
    () => ({
      dragX: motionValue(0),
      dragY: motionValue(0),
      arm: motionValue(0),
      settle: motionValue(0),
      fly: motionValue(0),
      open: motionValue(0),
      scroll: motionValue(0),
      exit: motionValue(0),
      intro: motionValue(1),
    }),
    [],
  )
  const throwY = useRef(new Map<AppId, MotionValue<number>>())
  const throwFor = (id: AppId) => {
    let v = throwY.current.get(id)
    if (!v) {
      v = motionValue(0)
      v.on('change', () => schedule())
      throwY.current.set(id, v)
    }
    return v
  }

  const running = useRef(new Set<AnimationPlaybackControls>())
  const run = (value: MotionValue<number>, to: number, spring: Spring, velocity = 0, onDone?: () => void) => {
    const options = reduceMotion
      ? { duration: 0.18, ease: 'easeOut' as const }
      : { ...spring, velocity: Number.isFinite(velocity) ? velocity : 0 }
    const controls = animate(value, to, options)
    running.current.add(controls)
    controls.then(() => {
      running.current.delete(controls)
      onDone?.()
    })
    return controls
  }
  const stopAll = () => {
    running.current.forEach((c) => c.stop())
    running.current.clear()
  }

  /* ---------- geometri & elemen ---------- */
  const rootRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const size = useRef({ W: 390, H: 844 })
  type Slot = {
    card: HTMLDivElement | null
    clip: HTMLDivElement | null
    content: HTMLDivElement | null
    glyph: HTMLDivElement | null
    label: HTMLDivElement | null
  }
  const cards = useRef(new Map<AppId, Slot>())
  const slot = (id: AppId) => {
    let s = cards.current.get(id)
    if (!s) {
      s = { card: null, clip: null, content: null, glyph: null, label: null }
      cards.current.set(id, s)
    }
    return s
  }
  const icons = useRef(new Map<AppId, HTMLElement>())
  const homeScale = useRef(1)

  /** Persegi ikon di layar utama dalam koordinat stage, dikoreksi dari skala layar utama saat ini. */
  const measureIcon = (id: AppId | null): Rect | null => {
    const root = rootRef.current
    const el = id ? icons.current.get(id) : null
    if (!root || !el || !el.isConnected) return null
    const rr = root.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.width === 0) return null
    const { W, H } = size.current
    const k = homeScale.current || 1
    const cx = W / 2 + (r.left + r.width / 2 - rr.left - W / 2) / k
    const cy = H / 2 + (r.top + r.height / 2 - rr.top - H / 2) / k
    const w = r.width / k
    // Ikon di halaman lain dari layar utama berada di luar layar; pakai animasi tanpa ikon.
    if (cx < 0 || cx > W || cy < 0 || cy > H) return null
    return { cx, cy, w }
  }

  /* ---------- parameter animasi yang sedang berjalan ---------- */
  const anim = useRef({
    release: FULL,
    releaseHomeVis: 0,
    target: FULL as Pose,
    origin: FULL as Pose,
    flyVelocity: 0,
    target2: null as AppId | null,
  })

  /* ---------- layout: menulis transform ke DOM sekali per frame ---------- */
  const frame = useRef(0)
  const schedule = useCallback(() => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      layout()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const layoutRef = useRef<() => void>(() => {})
  const layout = () => layoutRef.current()

  layoutRef.current = () => {
    const v = viewRef.current
    const { W, H } = size.current
    const a = anim.current
    const scroll = mv.scroll.get()
    const arm = mv.arm.get()
    const p = clamp(-mv.dragY.get() / H, 0, 1)

    const sw = (id: AppId): Pose => {
      const idx = v.order.indexOf(id)
      const pose = switcherPose(idx - scroll, W, H)
      const t = throwY.current.get(id)?.get() ?? 0
      return { ...pose, y: pose.y + t, o: pose.o * (1 - clamp(-t / H) * 0.7) }
    }
    const swEnter = (id: AppId): Pose => {
      const pose = sw(id)
      return { ...pose, x: pose.x - (1 - arm) * W * 0.6, o: pose.o * arm }
    }

    let homeVis = 1
    let switcherVis = 0
    const poses = new Map<AppId, { pose: Pose; glyph: number; z: number }>()
    const put = (id: AppId, pose: Pose, glyph = 0, z = 50 - Math.max(0, v.order.indexOf(id))) => poses.set(id, { pose, glyph, z })

    switch (v.phase) {
      case 'idle':
        if (v.screen.kind === 'app') put(v.screen.app, FULL, 0, 60)
        homeVis = v.screen.kind === 'home' ? 1 : 0
        break
      case 'opening': {
        const t = mv.open.get()
        if (v.app) put(v.app, lerpPose(a.origin, FULL, t), v.origin === 'icon' ? 1 - smoothstep(0.04, 0.32, t) : 0, 60)
        homeVis = 1 - clamp(t)
        break
      }
      case 'flyHome': {
        const t = mv.fly.get()
        const pose = lerpPose(a.release, a.target, t)
        const toIcon = a.target.c === 1
        pose.o = toIcon ? 1 - smoothstep(0.9, 1, t) : pose.o
        if (v.app) put(v.app, pose, toIcon ? smoothstep(0.45, 0.85, t) : 0, 60)
        homeVis = lerp(a.releaseHomeVis, 1, clamp(t))
        break
      }
      case 'drag': {
        if (v.app) put(v.app, dragPose(mv.dragX.get(), mv.dragY.get(), H), 0, 60)
        if (v.armed || arm > 0) for (const id of v.order) if (id !== v.app) put(id, swEnter(id))
        homeVis = lerp(clamp(p / 0.35), 0.45, arm)
        switcherVis = arm
        break
      }
      case 'homeDrag':
        for (const id of v.order) put(id, swEnter(id))
        homeVis = 1 - 0.55 * arm
        switcherVis = arm
        break
      case 'toSwitcher': {
        const t = mv.settle.get()
        for (const id of v.order) {
          if (id === v.app) put(id, lerpPose(a.release, sw(id), t))
          else put(id, swEnter(id))
        }
        homeVis = 0.45
        switcherVis = arm
        break
      }
      case 'switcher':
        for (const id of v.order) put(id, sw(id))
        homeVis = 0.45
        switcherVis = 1
        break
      case 'cardOpening': {
        const t = mv.open.get()
        for (const id of v.order) {
          if (id === a.target2) put(id, lerpPose(a.origin, FULL, t), 0, 60)
          else {
            const pose = sw(id)
            put(id, { ...pose, s: pose.s * (1 - 0.08 * t), o: pose.o * (1 - clamp(t * 1.6)) })
          }
        }
        homeVis = lerp(0.45, 0, clamp(t))
        switcherVis = 1 - clamp(t * 2)
        break
      }
      case 'switcherToHome': {
        const t = mv.exit.get()
        for (const id of v.order) {
          const pose = sw(id)
          put(id, { ...pose, s: pose.s * (1 - 0.12 * t), y: pose.y + H * 0.06 * t, o: pose.o * (1 - clamp(t * 1.4)) })
        }
        homeVis = lerp(0.45, 1, clamp(t))
        switcherVis = 1 - clamp(t * 1.6)
        break
      }
      case 'unlocking':
        homeVis = 1
        break
    }

    // Kartu app
    for (const [id, s] of cards.current) {
      const el = s.card
      if (!el) continue
      const entry = poses.get(id)
      if (!entry) continue
      const { pose, glyph, z } = entry
      const scale = Math.max(pose.s, 0.01)
      const isFull = pose === FULL
      // Hanya transform & opacity di kartu (dikerjakan compositor). Sudut membulat dan potongan persegi
      // ada di lapisan clip, sementara konten app digeser sebagai layer sendiri agar tidak di-raster ulang.
      el.style.transform = isFull ? 'none' : `translate3d(${pose.x}px, ${pose.y}px, 0) scale(${scale})`
      el.style.opacity = String(clamp(pose.o))
      el.style.zIndex = String(z)
      const inset = isFull ? 0 : Math.max(0, (H - W) / 2) * clamp(pose.c)
      if (s.clip) {
        s.clip.style.top = `${inset}px`
        s.clip.style.bottom = `${inset}px`
        s.clip.style.borderRadius = isFull ? '0px' : `${pose.r / scale}px`
      }
      if (s.content) {
        s.content.style.transform = inset ? `translate3d(0, ${-inset}px, 0)` : 'none'
        s.content.style.willChange = isFull ? '' : 'transform'
      }
      if (s.glyph) s.glyph.style.opacity = String(clamp(glyph))
      if (s.label) {
        const left = W / 2 + pose.x - (scale * W) / 2
        const top = H / 2 + pose.y - (scale * H) / 2 - 34
        s.label.style.transform = `translate3d(${left}px, ${top}px, 0)`
        s.label.style.opacity = String(clamp(switcherVis * pose.o))
      }
    }

    // Layar utama di belakang kartu
    const intro = mv.intro.get()
    const k = v.phase === 'unlocking' ? lerp(1.12, 1, intro) : 0.9 + 0.1 * homeVis
    homeScale.current = k
    if (homeRef.current) {
      homeRef.current.style.transform = k === 1 ? 'none' : `scale(${k})`
      homeRef.current.style.opacity = v.phase === 'unlocking' ? String(clamp(intro)) : '1'
    }
    if (dimRef.current) dimRef.current.style.opacity = String(v.phase === 'unlocking' ? 0 : (1 - clamp(homeVis)) * 0.7)
  }

  /* ---------- ukuran stage ---------- */
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      size.current = { W: el.clientWidth || 390, H: el.clientHeight || 844 }
      // Konten app tetap setinggi layar walau lapisan clip dipotong menjadi persegi.
      el.style.setProperty('--stage-h', `${size.current.H}px`)
      schedule()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [schedule])

  useEffect(() => {
    const unsubs = Object.values(mv).map((value) => value.on('change', schedule))
    return () => unsubs.forEach((u) => u())
  }, [mv, schedule])

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      // StrictMode menjalankan cleanup ini sekali saat mount; tanpa reset, schedule() terkunci selamanya.
      frame.current = 0
    },
    [],
  )

  /* ---------- daftar kartu App Switcher ---------- */
  const switcherOrder = (active: AppId | null) => {
    const { recentApps: recents, cameraUsed } = storeRef.current
    const list = recents.filter((a) => !(a === 'camera' && cameraUsed))
    return active ? [active, ...list.filter((a) => a !== active)] : list
  }

  const update = (patch: Partial<View>, bumpToken = true) => {
    const next = { ...viewRef.current, ...patch, token: viewRef.current.token + (bumpToken ? 1 : 0) }
    viewRef.current = next
    setView(next)
    return next
  }

  /* ---------- menjalankan animasi setiap kali fase berganti ---------- */
  useLayoutEffect(() => {
    const v = viewRef.current
    const token = v.token
    const { W, H } = size.current
    const a = anim.current
    const done = (patch: Partial<View>) => () => {
      if (viewRef.current.token === token) update(patch)
    }
    // Spring dimulai setelah frame pertama dipaint: biaya memasang/menampilkan app terjadi sebelum t=0,
    // jadi kurva spring tidak melompat karena frame pertama yang berat.
    const afterPaint = (fn: () => void) =>
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (viewRef.current.token === token) fn()
      }))
    switch (v.phase) {
      case 'idle':
        stopAll()
        mv.dragX.set(0)
        mv.dragY.set(0)
        mv.arm.set(0)
        mv.settle.set(0)
        mv.intro.set(1)
        throwY.current.forEach((t) => t.set(0))
        break
      case 'opening': {
        stopAll()
        const rect = v.origin === 'icon' ? measureIcon(v.app) : null
        a.origin = rect && !reduceMotion ? iconPose(rect, W, H) : centerPose(H)
        mv.open.set(0)
        afterPaint(() => run(mv.open, 1, SPRING.appOpen, 0, done({ phase: 'idle' })))
        break
      }
      case 'flyHome': {
        stopAll()
        const rect = measureIcon(v.app)
        a.target = rect && !reduceMotion ? iconPose(rect, W, H) : { x: 0, y: H * 0.06, s: 0.3, r: 24, c: 0.4, o: 0 }
        mv.fly.set(0)
        const velocity = a.flyVelocity
        a.flyVelocity = 0
        // Dari gesture, layar utama sudah tampil, jadi langsung jalan untuk meneruskan velocity jari.
        const start = () => run(mv.fly, 1, SPRING.appClose, velocity, done({ phase: 'idle', app: null }))
        if (velocity) start()
        else afterPaint(start)
        mv.arm.set(0)
        break
      }
      case 'toSwitcher':
        mv.settle.set(0)
        run(mv.arm, 1, SPRING.switcher)
        run(mv.settle, 1, SPRING.switcher, 0, done({ phase: 'switcher' }))
        break
      case 'switcher':
        mv.arm.set(1)
        mv.settle.set(1)
        mv.dragX.set(0)
        mv.dragY.set(0)
        break
      case 'cardOpening':
        mv.open.set(0)
        run(mv.open, 1, SPRING.appOpen, 0, () => {
          if (viewRef.current.token !== token || !a.target2) return
          const target = a.target2
          update({ phase: 'idle', app: target, expect: { kind: 'app', app: target } })
          openApp(target)
        })
        break
      case 'switcherToHome':
        mv.exit.set(0)
        run(mv.exit, 1, SPRING.switcher, 0, done({ phase: 'idle', app: null, order: [] }))
        break
      case 'unlocking':
        stopAll()
        mv.intro.set(0)
        run(mv.intro, 1, SPRING.appOpen, 0, done({ phase: 'idle' }))
        break
    }
    layout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.token])

  /* ---------- gesture ---------- */
  const gesture = useRef<Gesture | null>(null)
  const tracker = useRef(createVelocityTracker())
  const holdTimer = useRef(0)
  const slowSince = useRef(0)

  const clearHold = () => {
    window.clearTimeout(holdTimer.current)
    holdTimer.current = 0
    slowSince.current = 0
  }

  const arm = () => {
    const v = viewRef.current
    if (v.armed) return
    const active = v.phase === 'drag' ? v.app : null
    // Kamera sekali pakai tidak muncul di App Switcher.
    if (active === 'camera' && storeRef.current.cameraUsed) return
    const order = switcherOrder(active)
    if (order.length === 0) return
    mv.scroll.set(0)
    order.forEach((id) => throwFor(id).set(0))
    update({ armed: true, order }, false)
    run(mv.arm, 1, SPRING.switcher)
    navigator.vibrate?.(8)
  }
  const disarm = () => {
    if (!viewRef.current.armed) return
    update({ armed: false }, false)
    run(mv.arm, 0, SPRING.snapBack)
  }

  const onMove = (e: PointerEvent) => {
    const g = gesture.current
    if (!g || e.pointerId !== g.pointerId) return
    tracker.current.add(e.clientX, e.clientY)
    const { W, H } = size.current
    const rawX = e.clientX - g.startX
    const rawY = e.clientY - g.startY
    if (!g.moved) {
      if (Math.hypot(rawX, rawY) < 6) return
      g.moved = true
      g.axis = Math.abs(rawX) > Math.abs(rawY) ? 'x' : 'y'
      if (g.kind === 'bar') {
        stopAll()
        const v = viewRef.current
        if (g.surface === 'app' && v.screen.kind === 'app' && (v.phase === 'idle' || v.phase === 'drag')) {
          update({ phase: 'drag', app: v.screen.app, armed: false, order: [] }, v.phase !== 'drag')
        } else if (g.surface === 'home' && v.phase === 'idle') {
          update({ phase: 'homeDrag', armed: false, order: [] })
        }
      }
    }
    const v = viewRef.current

    if (g.kind === 'switcher') {
      if (g.onBar) return
      if (g.axis === 'y' && g.card && rawY < 0) {
        throwFor(g.card).set(rawY)
      } else if (g.axis === 'y' && g.card) {
        throwFor(g.card).set(rubberband(rawY, H * 0.2))
      } else {
        const gap = W * CARD_GAP
        const max = Math.max(0, v.order.length - 1)
        const raw = g.scroll0 + rawX / gap
        const bounded = clamp(raw, 0, max)
        mv.scroll.set(bounded + rubberband((raw - bounded) * gap, W) / gap)
      }
      return
    }

    // Home bar
    const dy = g.baseY + rawY
    const progress = clamp(-dy / H, 0, 1)
    if (v.phase === 'drag') {
      mv.dragX.set(g.baseX + rawX * 0.9)
      mv.dragY.set(dy > 0 ? rubberband(dy, H * 0.25) : dy)
    }
    if (v.phase !== 'drag' && v.phase !== 'homeDrag') return

    const { vx, vy } = tracker.current.get()
    const speed = Math.hypot(vx, vy)
    if (v.armed) {
      if (vy < -1200 || progress < 0.05) disarm()
      return
    }
    // Menahan jari di tengah layar membuka App Switcher.
    if (progress < 0.1 || progress > 0.6) {
      clearHold()
      slowSince.current = 0
      return
    }
    // Jari diam: tidak ada event gerak lagi selama 140 ms.
    window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = 0
      if (gesture.current?.kind === 'bar') arm()
    }, 140)
    // Jari bergerak sangat pelan juga dihitung menahan.
    const now = performance.now()
    if (speed < 90) {
      slowSince.current ||= now
      if (now - slowSince.current > 200) arm()
    } else slowSince.current = 0
  }

  const onUp = (e: PointerEvent) => {
    const g = gesture.current
    if (!g || e.pointerId !== g.pointerId) return
    gesture.current = null
    clearHold()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    const cancelled = e.type === 'pointercancel'
    const { vx, vy } = tracker.current.get()
    const { W, H } = size.current
    const v = viewRef.current

    if (g.kind === 'switcher') return releaseSwitcher(g, vx, vy, cancelled)

    if (!g.moved) {
      if (!cancelled && performance.now() - g.t0 < 500) g.onTap?.()
      return
    }

    if (v.phase === 'homeDrag') {
      if (v.armed && !cancelled) {
        update({ phase: 'toSwitcher', app: null, expect: { kind: 'switcher' } })
        openSwitcher()
      } else {
        update({ phase: 'idle', armed: false, order: [] })
        g.onTap?.()
      }
      return
    }
    if (v.phase !== 'drag' || !v.app) return

    const a = anim.current
    const dy = mv.dragY.get()
    const progress = clamp(-dy / H, 0, 1)
    a.release = dragPose(mv.dragX.get(), dy, H)
    a.releaseHomeVis = lerp(clamp(progress / 0.35), 0.45, mv.arm.get())

    if (v.armed && !cancelled) {
      update({ phase: 'toSwitcher', expect: { kind: 'switcher' } })
      openSwitcher()
      return
    }
    const projected = clamp(-(dy + project(vy)) / H, -1, 2)
    const goingHome = !cancelled && ((vy < -300 && progress > 0.02) || projected > 0.28)
    if (goingHome) {
      // Velocity jari diteruskan ke spring: jarak sisa ke ikon menentukan satuannya.
      const rect = measureIcon(v.app)
      const targetY = rect ? rect.cy - H / 2 : H * 0.06
      const remaining = targetY - a.release.y
      a.flyVelocity = Math.abs(remaining) > 1 ? clamp(vy / remaining, -3, 6) : 0
      update({ phase: 'flyHome', expect: { kind: 'home' } })
      goHome()
      return
    }
    run(mv.arm, 0, SPRING.snapBack)
    run(mv.dragX, 0, SPRING.snapBack, vx)
    run(mv.dragY, 0, SPRING.snapBack, vy, () => {
      if (!gesture.current && viewRef.current.phase === 'drag') update({ phase: 'idle', armed: false, order: [] })
    })
  }

  const releaseSwitcher = (g: Gesture, vx: number, vy: number, cancelled: boolean) => {
    const v = viewRef.current
    const { W, H } = size.current
    if (g.onBar || (!g.moved && !g.card)) {
      if (!cancelled) {
        update({ phase: 'switcherToHome', expect: { kind: 'home' } })
        goHome()
      }
      return
    }
    if (!g.moved && g.card) {
      const a = anim.current
      a.target2 = g.card
      const idx = v.order.indexOf(g.card)
      a.origin = switcherPose(idx - mv.scroll.get(), W, H)
      update({ phase: 'cardOpening', app: g.card })
      return
    }
    if (g.axis === 'y' && g.card) {
      const id = g.card
      const t = throwFor(id)
      if (!cancelled && (vy < -500 || t.get() < -H * 0.22)) {
        run(t, -H * 1.2, SPRING.throwOut, vy, () => {
          const order = viewRef.current.order.filter((a) => a !== id)
          closeRecentApp(id)
          t.set(0)
          if (order.length === 0) {
            update({ order, phase: 'switcherToHome', expect: { kind: 'home' } })
            goHome()
            return
          }
          update({ order }, false)
          const max = order.length - 1
          if (mv.scroll.get() > max) run(mv.scroll, max, SPRING.switcher)
          else schedule()
        })
      } else run(t, 0, SPRING.snapBack, vy)
      return
    }
    const gap = W * CARD_GAP
    const max = Math.max(0, v.order.length - 1)
    const target = clamp(Math.round(mv.scroll.get() + project(vx) / gap), 0, max)
    run(mv.scroll, target, SPRING.switcher, vx / gap)
  }

  const begin = (e: React.PointerEvent<HTMLElement>, init: Omit<Gesture, 'pointerId' | 'startX' | 'startY' | 't0' | 'moved' | 'axis'>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    // Mencegah seleksi teks / drag bawaan browser selama gesture.
    e.preventDefault()
    gesture.current = { ...init, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, t0: performance.now(), moved: false, axis: null }
    tracker.current.reset()
    tracker.current.add(e.clientX, e.clientY)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  const homeBar = (surface: HomeBarSurface, onTap: () => void): HomeBarHandlers => ({
    onPointerDown: (e) => {
      const v = viewRef.current
      // Gesture baru boleh memotong animasi kembali (snap back) dan melanjutkan dari posisi kartu saat ini.
      const resumable = v.phase === 'drag'
      if (v.phase !== 'idle' && !resumable) return
      e.stopPropagation()
      if (resumable) stopAll()
      begin(e, {
        kind: 'bar',
        surface,
        onTap,
        baseX: resumable ? mv.dragX.get() : 0,
        baseY: resumable ? mv.dragY.get() : 0,
        card: null,
        scroll0: 0,
        onBar: true,
      })
    },
    // Klik dari keyboard (detail 0) tetap berfungsi; klik pointer sudah ditangani sebagai tap.
    onClick: (e) => {
      if (e.detail === 0) onTap()
    },
  })

  const onSwitcherPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = viewRef.current
    if (v.phase !== 'switcher') return
    const root = rootRef.current
    if (!root) return
    stopAll()
    const rr = root.getBoundingClientRect()
    const { W, H } = size.current
    const px = e.clientX - rr.left
    const py = e.clientY - rr.top
    const onBar = py > H - HOME_BAR_ZONE
    let card: AppId | null = null
    if (!onBar) {
      // Kartu yang lebih baru berada di atas, jadi diperiksa lebih dulu.
      for (const id of v.order) {
        const pose = switcherPose(v.order.indexOf(id) - mv.scroll.get(), W, H)
        const w = W * pose.s
        const h = H * pose.s
        const cx = W / 2 + pose.x
        const cy = H / 2 + pose.y + (throwY.current.get(id)?.get() ?? 0)
        if (Math.abs(px - cx) <= w / 2 && Math.abs(py - cy) <= h / 2) {
          card = id
          break
        }
      }
    }
    begin(e, { kind: 'switcher', surface: null, onTap: null, baseX: 0, baseY: 0, card, scroll0: mv.scroll.get(), onBar })
  }

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      clearHold()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const registerIcon = useCallback((app: AppId, el: HTMLElement | null) => {
    if (el) icons.current.set(app, el)
    else icons.current.delete(app)
  }, [])

  /* ---------- apa yang dirender ---------- */
  const v = current
  const unlocked = v.screen.kind !== 'lock' && v.screen.kind !== 'passcode'
  const inSwitcherPhase = SWITCHER_PHASES.includes(v.phase)
  const showsOrder = inSwitcherPhase || ((v.phase === 'drag' || v.phase === 'homeDrag') && v.armed)

  const isVisible = (id: AppId) => {
    switch (v.phase) {
      case 'idle':
        return v.screen.kind === 'app' && v.screen.app === id
      case 'opening':
      case 'flyHome':
        return v.app === id
      case 'drag':
        return v.app === id || (v.armed && v.order.includes(id))
      default:
        return showsOrder && v.order.includes(id)
    }
  }
  const presenceOf = (id: AppId) =>
    v.screen.kind === 'app' && v.screen.app === id && !inSwitcherPhase ? 'active' : 'preview'

  // App yang pernah tampil tetap terpasang (tersembunyi) supaya state-nya utuh saat dibuka lagi.
  const mounted = useRef(new Set<AppId>())
  if (unlocked) for (const id of Object.keys(apps) as AppId[]) if (isVisible(id)) mounted.current.add(id)
  for (const id of mounted.current) if (!recentApps.includes(id) && !isVisible(id)) mounted.current.delete(id)

  const homeVisible = unlocked && (v.screen.kind === 'home' || v.screen.kind === 'switcher' || v.phase !== 'idle')

  const ctx = useMemo<StageContext>(
    () => ({ phase: v.phase, homeBar, registerIcon }),
    // homeBar membaca semuanya lewat ref, jadi aman dibuat ulang hanya saat fase berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v.phase, registerIcon],
  )

  // Layout ulang setelah setiap render agar elemen yang baru tampil langsung mendapat pose yang benar.
  useLayoutEffect(() => layout())

  return (
    <StageCtx.Provider value={ctx}>
      <div ref={rootRef} className="absolute inset-0 overflow-hidden">
        {/* Wallpaper di belakang layar utama, supaya tepi tidak hitam saat layar utama mengecil. */}
        <div className="absolute inset-0 isolate bg-cover bg-center" style={{ backgroundImage: unlocked ? `url(${withBasePath('/images/wallpaper.jpg')})` : undefined }}>
        {unlocked && (
          <Activity mode={homeVisible ? 'visible' : 'hidden'}>
            {/* Layer permanen: scale layar utama (termasuk blur dock) cukup dikerjakan compositor. */}
            <div ref={homeRef} className="absolute inset-0 origin-center will-change-transform">
              <SurfaceCtx.Provider value="home">
                <HomeScreen />
              </SurfaceCtx.Provider>
            </div>
            <div ref={dimRef} className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} aria-hidden />
          </Activity>
        )}

        {[...mounted.current].map((id) => {
          const visible = unlocked && isVisible(id)
          const presence = presenceOf(id)
          const s = slot(id)
          return (
            <Activity key={id} mode={visible ? 'visible' : 'hidden'}>
              <div
                ref={(el) => {
                  s.card = el
                }}
                className="absolute inset-0 origin-center"
                style={{ willChange: v.phase === 'idle' ? undefined : 'transform, opacity' }}
              >
                <div
                  ref={(el) => {
                    s.clip = el
                  }}
                  className="absolute inset-x-0 overflow-hidden bg-black"
                  style={{ top: 0, bottom: 0 }}
                >
                  <div
                    ref={(el) => {
                      s.content = el
                    }}
                    className="absolute inset-x-0 top-0 h-full"
                    style={{ height: 'var(--stage-h, 100%)' }}
                  >
                    <AppPresenceProvider value={presence}>
                      <SurfaceCtx.Provider value="app">
                        <div className="h-full w-full" inert={presence !== 'active'}>
                          {apps[id]()}
                        </div>
                      </SurfaceCtx.Provider>
                    </AppPresenceProvider>
                  </div>
                  <div
                    ref={(el) => {
                      s.glyph = el
                    }}
                    className="pointer-events-none absolute left-0 top-1/2 aspect-square w-full -translate-y-1/2"
                    style={{ opacity: 0 }}
                    aria-hidden
                  >
                    <AppGlyph kind={id} />
                  </div>
                </div>
              </div>
            </Activity>
          )
        })}

        {showsOrder && (
          <div
            className="absolute inset-0 z-[80] touch-none select-none"
            onPointerDown={onSwitcherPointerDown}
            role="dialog"
            aria-label="App Switcher"
          >
            {v.order.map((id) => (
              <div
                key={id}
                ref={(el) => {
                  slot(id).label = el
                }}
                className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 text-[13px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                style={{ opacity: 0 }}
              >
                <span className="block size-[26px]">
                  <AppGlyph kind={id} />
                </span>
                {APP_LABEL[id]}
              </div>
            ))}
            {v.phase === 'switcher' && (
              <div className="sr-only">
                {v.order.map((id) => (
                  <button key={id} type="button" onClick={() => {
                    anim.current.target2 = id
                    anim.current.origin = switcherPose(v.order.indexOf(id) - mv.scroll.get(), size.current.W, size.current.H)
                    update({ phase: 'cardOpening', app: id })
                  }}>
                    {`Buka ${APP_LABEL[id]}`}
                  </button>
                ))}
                <button type="button" onClick={() => {
                  update({ phase: 'switcherToHome', expect: { kind: 'home' } })
                  goHome()
                }}>
                  Ke Layar Utama
                </button>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[26px] items-center justify-center" aria-hidden>
              <span className="h-[5px] w-[136px] rounded-full bg-white" />
            </div>
          </div>
        )}
        </div>

        {children}
      </div>
    </StageCtx.Provider>
  )
}
