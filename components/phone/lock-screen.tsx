'use client'

import { withBasePath } from '@/lib/base-path'
import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from 'motion/react'
import { Camera, Flashlight, Lock, MessageCircle } from 'lucide-react'
import { useStory } from '@/lib/story/store'
import { contacts } from '@/lib/story/contacts'
import { formatIosListDate } from '@/lib/story/time'
import { SPRING, clamp, createVelocityTracker, project, rubberband } from '@/lib/motion/ios-physics'
import { HomeIndicator, StatusBar } from './chrome'

function LockNotifications() {
  const { smsNotifications, openSmsFromLock } = useStory()
  if (smsNotifications.length === 0) return null
  return (
    <ul className="flex flex-col gap-2 px-3 pb-4" aria-label="Notifikasi">
      {smsNotifications.map(({ thread, unread }) => {
        const c = contacts[thread.contactId]
        const last = unread[unread.length - 1]
        const more = unread.length - 1
        return (
          <li key={thread.id}>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={() => openSmsFromLock(thread.id)}
              className="relative flex w-full items-start gap-2.5 rounded-[20px] bg-white/45 px-3 py-2.5 text-left text-black backdrop-blur-xl active:bg-white/60"
            >
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-b from-[#5ef67a] to-[#21c33e]">
                <MessageCircle fill="currentColor" className="size-5 fill-white text-white" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[14px] font-semibold">{c.name}</span>
                  <span className="shrink-0 text-[12px] text-black/50">{formatIosListDate(last.at)}</span>
                </span>
                <span className="line-clamp-2 text-[14px] leading-snug">{last.text.replace(/\n+/g, ' ')}</span>
                {more > 0 && <span className="mt-0.5 block text-[12px] text-black/50">{`${more} notifikasi lainnya`}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function LockScreen() {
  const { openPasscode, clock } = useStory()
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; startY: number; base: number } | null>(null)
  const tracker = useRef(createVelocityTracker())
  const opening = useRef(false)
  // y < 0: konten terangkat mengikuti jari; lapisan blur kode sandi memudar masuk sesuai jarak.
  const y = useMotionValue(0)
  const height = () => rootRef.current?.clientHeight || 844
  const veil = useTransform(y, (v) => clamp(-v / (height() * 0.45)))
  const contentOpacity = useTransform(y, (v) => 1 - clamp(-v / (height() * 0.5)))

  useEffect(() => () => y.stop(), [y])

  const release = (vy: number) => {
    const H = height()
    const projected = -(y.get() + project(vy)) / H
    const unlock = vy < -400 || projected > 0.3
    const spring = reduceMotion ? { duration: 0.18 } : { ...(unlock ? SPRING.appClose : SPRING.snapBack), velocity: vy }
    if (unlock) {
      opening.current = true
      animate(y, -H, spring).then(() => openPasscode())
    } else animate(y, 0, spring)
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex touch-none select-none flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${withBasePath('/images/wallpaper.jpg')})` }}
      onPointerDown={(e) => {
        if (opening.current) return
        y.stop()
        drag.current = { id: e.pointerId, startY: e.clientY, base: y.get() }
        tracker.current.reset()
        tracker.current.add(e.clientX, e.clientY)
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        tracker.current.add(e.clientX, e.clientY)
        const dy = d.base + e.clientY - d.startY
        y.set(dy > 0 ? rubberband(dy, height() * 0.2) : dy)
      }}
      onPointerUp={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        drag.current = null
        if (Math.abs(e.clientY - d.startY) < 6 && y.get() === d.base) return
        release(tracker.current.get().vy)
      }}
      onPointerCancel={() => {
        drag.current = null
        release(0)
      }}
    >
      <motion.div className="pointer-events-none absolute inset-0 bg-black/45 backdrop-blur-xl" style={{ opacity: veil }} aria-hidden />
      <motion.div className="relative flex h-full flex-col" style={{ y, opacity: contentOpacity }}>
        <StatusBar tone="light" />
        <div className="flex flex-col items-center">
          <Lock className="size-[18px]" strokeWidth={2.5} aria-hidden />
          <p className="mt-2 text-[20px] font-semibold text-white/90">Rabu, 19 November</p>
          <p
            className="-mt-1 text-[104px] font-semibold leading-[1.05] tracking-[-0.03em] tabular-nums text-white/90"
            style={{ fontFamily: 'ui-rounded, "SF Pro Rounded", -apple-system, var(--font-noto), sans-serif' }}
          >
            {clock}
          </p>
        </div>
        <div className="flex-1" />
        <LockNotifications />
        <div className="flex items-end justify-between px-12 pb-5">
          <span className="flex size-[50px] items-center justify-center rounded-full bg-black/25 backdrop-blur-xl" aria-hidden>
            <Flashlight className="size-[22px]" />
          </span>
          <span className="flex size-[50px] items-center justify-center rounded-full bg-black/25 backdrop-blur-xl" aria-hidden>
            <Camera className="size-[22px]" />
          </span>
        </div>
        <p className="pb-2 text-center text-[13px] font-medium text-white/80">Geser ke atas untuk membuka</p>
        <HomeIndicator tone="light" onActivate={openPasscode} label="Buka kunci" />
      </motion.div>
    </div>
  )
}
