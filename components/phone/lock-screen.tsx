'use client'

import { withBasePath } from '@/lib/base-path'
import { useRef } from 'react'
import { Camera, Flashlight, Lock, MessageCircle } from 'lucide-react'
import { useStory } from '@/lib/story/store'
import { contacts } from '@/lib/story/contacts'
import { formatIosListDate } from '@/lib/story/time'
import { HomeIndicator, StatusBar } from './chrome'

function LockNotifications() {
  const { smsNotifications, openSmsFromLock } = useStory()
  if (smsNotifications.length === 0) return null
  return (
    <ul className="flex flex-col gap-2 px-3 pb-4" aria-label="알림">
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
                <MessageCircle className="size-5 fill-white text-white" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[14px] font-semibold">{c.name}</span>
                  <span className="shrink-0 text-[12px] text-black/50">{formatIosListDate(last.at)}</span>
                </span>
                <span className="line-clamp-2 text-[14px] leading-snug">{last.text.replace(/\n+/g, ' ')}</span>
                {more > 0 && <span className="mt-0.5 block text-[12px] text-black/50">{`외 ${more}개의 알림`}</span>}
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
        <LockNotifications />
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
