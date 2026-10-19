'use client'

import { useStory, type AppId } from '@/lib/story/store'
import { AppGlyph, type IconKind } from './app-icons'
import { HomeIndicator, StatusBar } from './chrome'
import { CalendarWidget, WeatherWidget } from './widgets'

const HOME_APPS: { kind: IconKind; app: AppId; label: string }[] = [
  { kind: 'kakao', app: 'kakao', label: '카카오톡' },
  { kind: 'photos', app: 'photos', label: '사진' },
  { kind: 'settings', app: 'settings', label: '설정' },
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
      style={{ backgroundImage: 'url(/images/wallpaper.png)' }}
    >
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      <div className="relative flex h-full min-h-0 flex-col">
        <StatusBar tone="light" />
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <WeatherWidget />
            <CalendarWidget />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-5">
            {HOME_APPS.map((a) => (
              <button
                key={a.app}
                type="button"
                onClick={() => openApp(a.app)}
                className="flex flex-col items-center gap-1.5"
                aria-label={a.app === 'kakao' && totalUnread > 0 ? `${a.label}, 읽지 않은 메시지 ${totalUnread}개` : a.label}
              >
                <span className="relative block aspect-square w-full max-w-[62px]">
                  <AppGlyph kind={a.kind} />
                  {a.app === 'kakao' && totalUnread > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[13px] font-semibold text-white">
                      {totalUnread}
                    </span>
                  )}
                </span>
                <span className="text-[12px] drop-shadow">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1.5 py-3" aria-hidden>
          <span className="size-1.5 rounded-full bg-white" />
          <span className="size-1.5 rounded-full bg-white/40" />
        </div>
        <nav aria-label="독" className="mx-3 grid grid-cols-4 gap-4 rounded-[30px] bg-white/25 px-4 py-3 backdrop-blur-2xl">
          {DOCK.map((d) =>
            d.app ? (
              <button
                key={d.label}
                type="button"
                onClick={() => openApp(d.app as AppId)}
                aria-label={d.label}
                className="mx-auto block aspect-square w-full max-w-[60px]"
              >
                <AppGlyph kind={d.kind} />
              </button>
            ) : (
              <span key={d.label} role="img" aria-label={d.label} className="mx-auto block aspect-square w-full max-w-[60px]">
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
