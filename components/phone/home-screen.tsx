'use client'

import { useRef, useState } from 'react'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'
import { useStory, type AppId } from '@/lib/story/store'
import { AppGlyph, type IconKind } from './app-icons'
import { useStage } from './app-stage'
import { HomeIndicator, StatusBar } from './chrome'
import { CalendarWidget, WeatherWidget } from './widgets'

type HomeApp = { kind: IconKind; label: string; app?: AppId; href?: string }

const PAGE_ONE: HomeApp[] = [
  { kind: 'kakao', app: 'kakao', label: 'KakaoTalk' },
  { kind: 'anyai', app: 'anyai', label: 'any ai' },
  { kind: 'photos', app: 'photos', label: 'Foto' },
  { kind: 'settings', app: 'settings', label: 'Pengaturan' },
  { kind: 'notes', app: 'notes', label: 'Catatan' },
  { kind: 'calendar', app: 'calendar', label: 'Kalender' },
  { kind: 'clock', app: 'clock', label: 'Jam' },
  { kind: 'instagram', app: 'instagram', label: 'Instagram' },
]

const PAGE_TWO: HomeApp[] = [
  { kind: 'voicememos', app: 'voicememos', label: 'Memo Suara' },
  { kind: 'youtube', href: 'https://youtu.be/TU0q9CW3Xmo?si=zcNEc8wU2Tr0XEja', label: 'YouTube' },
  { kind: 'catchtable', app: 'catchtable', label: 'CatchTable' },
]

const DOCK: HomeApp[] = [
  { kind: 'phone', app: 'phone', label: 'Telepon' },
  { kind: 'messages', app: 'messages', label: 'Pesan' },
  { kind: 'camera', app: 'camera', label: 'Kamera' },
  { kind: 'safari', app: 'safari', label: 'Safari' },
]

export function HomeScreen() {
  const { openApp, totalUnread, totalSmsUnread, cameraUsed } = useStory()
  const registerIcon = useStage()?.registerIcon
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
      className="absolute inset-0 flex flex-col bg-cover bg-center text-white"
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
          <section aria-label="Layar Utama halaman 1" className="flex w-full shrink-0 snap-start flex-col overflow-y-auto px-6 pt-1">
            <div className="grid grid-cols-2 gap-5">
              <WeatherWidget />
              <CalendarWidget onOpen={() => openApp('calendar')} />
            </div>
            <AppGrid apps={PAGE_ONE} totalUnread={totalUnread} onLaunch={launch} registerIcon={registerIcon} className="mt-5" />
          </section>
          <section aria-label="Layar Utama halaman 2" className="flex w-full shrink-0 snap-start flex-col overflow-y-auto px-6 pt-1">
            <AppGrid apps={PAGE_TWO} totalUnread={totalUnread} onLaunch={launch} registerIcon={registerIcon} />
          </section>
        </div>
        <div className="flex shrink-0 justify-center py-2">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-xl" role="tablist" aria-label="Halaman Layar Utama">
            {[0, 1].map((i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={page === i}
                aria-label={`Halaman ${i + 1}`}
                onClick={() => goToPage(i)}
                className={cn('size-[7px] rounded-full transition-colors', page === i ? 'bg-white' : 'bg-white/45')}
              />
            ))}
          </div>
        </div>
        <nav aria-label="Dock" className="mx-3 grid grid-cols-4 gap-5 rounded-[34px] bg-white/20 px-4 py-3.5 backdrop-blur-2xl">
          {DOCK.map((d) => {
            const count = d.app === 'messages' ? totalSmsUnread : 0
            return (
              <button
                key={d.label}
                ref={(el) => {
                  if (d.app) registerIcon?.(d.app, el)
                }}
                type="button"
                onClick={() => d.app && launch(d.app)}
                aria-label={count > 0 ? `${d.label}, ${count} pesan belum dibaca` : d.label}
                aria-disabled={d.app === 'camera' && cameraUsed ? true : undefined}
                className="relative mx-auto block aspect-square w-full max-w-[64px] active:opacity-70"
              >
                <AppGlyph kind={d.kind} />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[13px] font-medium text-white">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <HomeIndicator tone="light" onActivate={() => goToPage(0)} label="Layar Utama" />
      </div>
    </div>
  )
}

function AppGrid({
  apps,
  totalUnread,
  onLaunch,
  registerIcon,
  className,
}: {
  apps: HomeApp[]
  totalUnread: number
  onLaunch: (app: AppId) => void
  registerIcon?: (app: AppId, el: HTMLElement | null) => void
  className?: string
}) {
  const { totalSmsUnread } = useStory()
  return (
    <div className={cn('grid grid-cols-4 gap-x-5 gap-y-4', className)}>
      {apps.map((a) => {
        const count = a.app === 'kakao' ? totalUnread : a.app === 'messages' ? totalSmsUnread : 0
        const badge = count > 0
        const content = (
          <>
            <span
              ref={(el) => {
                if (a.app) registerIcon?.(a.app, el)
              }}
              className="relative block aspect-square w-full max-w-[64px]"
            >
              <AppGlyph kind={a.kind} />
              {badge && (
                <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[13px] font-medium text-white">
                  {count}
                </span>
              )}
            </span>
            <span className="max-w-full truncate text-[11.5px] font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">{a.label}</span>
          </>
        )
        const cls = 'flex flex-col items-center gap-[5px] active:opacity-70'
        if (a.href) {
          return (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${a.label} (jendela baru)`}>
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
            aria-label={badge ? `${a.label}, ${count} pesan belum dibaca` : a.label}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
