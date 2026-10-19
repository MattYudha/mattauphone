'use client'

import { useRef } from 'react'
import { Camera, Flashlight, Lock } from 'lucide-react'
import { useStory } from '@/lib/story/store'
import { HomeIndicator, StatusBar } from './chrome'

export function LockScreen() {
  const { openPasscode } = useStory()
  const startY = useRef<number | null>(null)

  return (
    <div
      className="absolute inset-0 flex touch-none select-none flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: 'url(/images/wallpaper.png)' }}
      onPointerDown={(e) => (startY.current = e.clientY)}
      onPointerUp={(e) => {
        if (startY.current !== null && startY.current - e.clientY > 60) openPasscode()
        startY.current = null
      }}
    >
      <div className="absolute inset-0 bg-black/15" aria-hidden />
      <div className="relative flex h-full flex-col">
        <StatusBar tone="light" />
        <div className="mt-2 flex flex-col items-center">
          <Lock className="size-5 opacity-90" aria-hidden />
          <p className="mt-3 text-lg font-medium tracking-wide">11월 19일 수요일</p>
          <p className="text-[88px] font-bold leading-none tracking-tight tabular-nums drop-shadow-sm">18:57</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-end justify-between px-11 pb-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-md" aria-hidden>
            <Flashlight className="size-5" />
          </span>
          <span className="flex size-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-md" aria-hidden>
            <Camera className="size-5" />
          </span>
        </div>
        <p className="pb-1 text-center text-sm text-white/85">위로 쓸어올려 잠금 해제</p>
        <HomeIndicator tone="light" onActivate={openPasscode} label="잠금 해제" />
      </div>
    </div>
  )
}
