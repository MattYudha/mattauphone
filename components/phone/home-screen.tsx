'use client'

import { useRef, useState } from 'react'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'
import { useStory, type AppId } from '@/lib/story/store'
import { AppGlyph, type IconKind } from './app-icons'
import { HomeIndicator, StatusBar } from './chrome'
import { CalendarWidget, WeatherWidget } from './widgets'

type HomeApp = { kind: IconKind; label: string; app?: AppId; href?: string }

const PAGE_ONE: HomeApp[] = [
  { kind: 'kakao', app: 'kakao', label: '카카오톡' },
  { kind: 'anyai', app: 'anyai', label: 'any ai' },
  { kind: 'photos', app: 'photos', label: '사진' },
  { kind: 'settings', app: 'settings', label: '설정' },
  { kind: 'notes', app: 'notes', label: '메모' },
  { kind: 'calendar', app: 'calendar', label: '캘린더' },
  { kind: 'clock', app: 'clock', label: '시계' },
]

const PAGE_TWO: HomeApp[] = [
  { kind: 'voicememos', app: 'voicememos', label: '음성 메모' },
  { kind: 'youtube', href: 'https://youtu.be/TU0q9CW3Xmo?si=zcNEc8wU2Tr0XEja', label: 'YouTube' },
]

const DOCK: HomeApp[] = [
  { kind: 'phone', app: 'phone', label: '전화' },
  { kind: 'messages', app: 'messages', label: '메시지' },
  { kind: 'camera', app: 'camera', label: '카메라' },
  { kind: 'safari', app: 'safari', label: 'Safari' },
]

export function HomeScreen() {
  const { openApp, totalUnread, cameraUsed } = useStory()
  const [page, setPage] = useState(0)
  const pagerRef = useRef<HTMLDivElement>(null)

  const launch = (app: AppId) => {
    if (app === 'camera' && cameraUsed) return
    openApp(app)
  }

  const goToPage = (i: number) => {
    const el = pagerRef.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div
      className="animate-screen-in absolute inset-0 flex flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${withBasePath('/images/wallpaper.jpg')})` }}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <StatusBar tone="light" />
        <div
          ref={pagerRef}
          onScroll={(e) => {
            const el = e.currentTarget
            setPage(Math.round(el.scrollLeft / el.clientWidth))
          }}
          className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        >
          <section aria-label="홈 화면 1페이지" className="flex w-full shrink-0 snap-start flex-col overflow-y-auto px-6 pt-1">
            <div className="grid grid-cols-2 gap-5">
              <WeatherWidget />
              <CalendarWidget onOpen={() => openApp('calendar')} />
            </div>
            <AppGrid apps={PAGE_ONE} totalUnread={totalUnread} onLaunch={launch} className="mt-5" />
          </section>
          <section aria-label="홈 화면 2페이지" className="flex w-full shrink-0 snap-start flex-col overflow-y-auto px-6 pt-1">
            <AppGrid apps={PAGE_TWO} totalUnread={totalUnread} onLaunch={launch} />
          </section>
        </div>
        <div className="flex shrink-0 justify-center py-2">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-xl" role="tablist" aria-label="홈 화면 페이지">
            {[0, 1].map((i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={page === i}
                aria-label={`${i + 1}페이지`}
                onClick={() => goToPage(i)}
                className={cn('size-[7px] rounded-full transition-colors', page === i ? 'bg-white' : 'bg-white/45')}
              />
            ))}
          </div>
        </div>
        <nav aria-label="독" className="mx-3 grid grid-cols-4 gap-5 rounded-[34px] bg-white/20 px-4 py-3.5 backdrop-blur-2xl">
          {DOCK.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => d.app && launch(d.app)}
              aria-label={d.label}
              aria-disabled={d.app === 'camera' && cameraUsed ? true : undefined}
              className="mx-auto block aspect-square w-full max-w-[64px] active:opacity-70"
            >
              <AppGlyph kind={d.kind} />
            </button>
          ))}
        </nav>
        <HomeIndicator tone="light" onActivate={() => goToPage(0)} label="홈 화면" />
      </div>
    </div>
  )
}

function AppGrid({
  apps,
  totalUnread,
  onLaunch,
  className,
}: {
  apps: HomeApp[]
  totalUnread: number
  onLaunch: (app: AppId) => void
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-x-5 gap-y-4', className)}>
      {apps.map((a) => {
        const badge = a.app === 'kakao' && totalUnread > 0
        const content = (
          <>
            <span className="relative block aspect-square w-full max-w-[64px]">
              <AppGlyph kind={a.kind} />
              {badge && (
                <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[13px] font-medium text-white">
                  {totalUnread}
                </span>
              )}
            </span>
            <span className="max-w-full truncate text-[11.5px] font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">{a.label}</span>
          </>
        )
        const cls = 'flex flex-col items-center gap-[5px] active:opacity-70'
        if (a.href) {
          return (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${a.label} (새 창)`}>
              {content}
            </a>
          )
        }
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => a.app && onLaunch(a.app)}
            className={cls}
            aria-label={badge ? `${a.label}, 읽지 않은 메시지 ${totalUnread}개` : a.label}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
