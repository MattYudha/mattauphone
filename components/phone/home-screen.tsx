'use client'

import { withBasePath } from '@/lib/base-path'
import { Search } from 'lucide-react'
import { useStory, type AppId } from '@/lib/story/store'
import { AppGlyph, type IconKind } from './app-icons'
import { HomeIndicator, StatusBar } from './chrome'
import { CalendarWidget, WeatherWidget } from './widgets'

const HOME_APPS: { kind: IconKind; app: AppId | null; label: string }[] = [
  { kind: 'kakao', app: 'kakao', label: '카카오톡' },
  { kind: 'anyai', app: 'anyai', label: 'any ai' },
  { kind: 'photos', app: 'photos', label: '사진' },
  { kind: 'settings', app: 'settings', label: '설정' },
  { kind: 'calendar', app: null, label: '캘린더' },
  { kind: 'clock', app: null, label: '시계' },
]

const DOCK: { kind: IconKind; app: AppId | null; label: string }[] = [
  { kind: 'phone', app: 'phone', label: '전화' },
  { kind: 'messages', app: 'messages', label: '메시지' },
  { kind: 'camera', app: null, label: '카메라' },
  { kind: 'safari', app: 'safari', label: 'Safari' },
]

export function HomeScreen() {
  const { openApp, totalUnread } = useStory()

  return (
    <div
      className="animate-screen-in absolute inset-0 flex flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${withBasePath('/images/wallpaper.png')})` }}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <StatusBar tone="light" />
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-1">
          <div className="grid grid-cols-2 gap-5">
            <WeatherWidget />
            <CalendarWidget />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-x-5 gap-y-4">
            {HOME_APPS.map((a) => {
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
                  <span className="max-w-full truncate text-[11.5px] font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
                    {a.label}
                  </span>
                </>
              )
              return a.app ? (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => openApp(a.app as AppId)}
                  className="flex flex-col items-center gap-[5px] active:opacity-70"
                  aria-label={badge ? `${a.label}, 읽지 않은 메시지 ${totalUnread}개` : a.label}
                >
                  {content}
                </button>
              ) : (
                <span key={a.label} role="img" aria-label={a.label} className="flex flex-col items-center gap-[5px]">
                  {content}
                </span>
              )
            })}
          </div>
        </div>
        <div className="flex shrink-0 justify-center py-2">
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[13px] font-medium backdrop-blur-xl" aria-hidden>
            <Search className="size-3.5" strokeWidth={2.5} />
            검색
          </span>
        </div>
        <nav aria-label="독" className="mx-3 grid grid-cols-4 gap-5 rounded-[34px] bg-white/20 px-4 py-3.5 backdrop-blur-2xl">
          {DOCK.map((d) =>
            d.app ? (
              <button
                key={d.label}
                type="button"
                onClick={() => openApp(d.app as AppId)}
                aria-label={d.label}
                className="mx-auto block aspect-square w-full max-w-[64px] active:opacity-70"
              >
                <AppGlyph kind={d.kind} />
              </button>
            ) : (
              <span key={d.label} role="img" aria-label={d.label} className="mx-auto block aspect-square w-full max-w-[64px]">
                <AppGlyph kind={d.kind} />
              </span>
            ),
          )}
        </nav>
        <HomeIndicator tone="light" onActivate={() => {}} label="홈 화면" />
      </div>
    </div>
  )
}
