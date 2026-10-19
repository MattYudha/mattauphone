'use client'

import { withBasePath } from '@/lib/base-path'
import { useRef } from 'react'
import { Camera, Flashlight, Lock } from 'lucide-react'
import { useStory } from '@/lib/story/store'
import { HomeIndicator, StatusBar } from './chrome'

export function LockScreen() {
  const { openPasscode, clock } = useStory()
  const startY = useRef<number | null>(null)

  return (
    <div
      className="absolute inset-0 flex touch-none select-none flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${withBasePath('/images/wallpaper.jpg')})` }}
      onPointerDown={(e) => (startY.current = e.clientY)}
      onPointerUp={(e) => {
        if (startY.current !== null && startY.current - e.clientY > 60) openPasscode()
        startY.current = null
      }}
    >
      <div className="relative flex h-full flex-col">
        <StatusBar tone="light" />
        <div className="flex flex-col items-center">
          <Lock className="size-[18px]" strokeWidth={2.5} aria-hidden />
          <p className="mt-2 text-[20px] font-semibold text-white/90">11월 19일 수요일</p>
          <p
            className="-mt-1 text-[104px] font-semibold leading-[1.05] tracking-[-0.03em] tabular-nums text-white/90"
            style={{ fontFamily: 'ui-rounded, "SF Pro Rounded", -apple-system, var(--font-noto), sans-serif' }}
          >
            {clock}
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-end justify-between px-12 pb-5">
          <span className="flex size-[50px] items-center justify-center rounded-full bg-black/25 backdrop-blur-xl" aria-hidden>
            <Flashlight className="size-[22px]" />
          </span>
          <span className="flex size-[50px] items-center justify-center rounded-full bg-black/25 backdrop-blur-xl" aria-hidden>
            <Camera className="size-[22px]" />
          </span>
        </div>
        <p className="pb-2 text-center text-[13px] font-medium text-white/80">쓸어올려서 열기</p>
        <HomeIndicator tone="light" onActivate={openPasscode} label="잠금 해제" />
      </div>
    </div>
  )
}
