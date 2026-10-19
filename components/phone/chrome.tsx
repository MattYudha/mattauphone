'use client'

import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStory } from '@/lib/story/store'

export function StatusBar({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[15px] font-semibold',
        tone === 'dark' ? 'text-black' : 'text-white',
        className,
      )}
    >
      <span className="tabular-nums">18:57</span>
      <span className="flex items-center gap-1.5" aria-label="신호, Wi-Fi, 배터리 85%">
        <Signal className="size-4" strokeWidth={2.5} aria-hidden />
        <Wifi className="size-4" strokeWidth={2.5} aria-hidden />
        <BatteryFull className="size-6" strokeWidth={1.8} aria-hidden />
      </span>
    </div>
  )
}

export function HomeIndicator({
  tone = 'dark',
  onActivate,
  label = '홈으로',
  className,
}: {
  tone?: 'dark' | 'light'
  onActivate?: () => void
  label?: string
  className?: string
}) {
  const { goHome } = useStory()
  return (
    <button
      type="button"
      onClick={onActivate ?? goHome}
      aria-label={label}
      className={cn('flex h-7 w-full shrink-0 items-center justify-center', className)}
    >
      <span className={cn('h-[5px] w-34 rounded-full', tone === 'dark' ? 'bg-black' : 'bg-white')} />
    </button>
  )
}

/** 앱 공통 골격: 상태바 + 고정 헤더 + 스크롤 영역 + 고정 하단 + 홈 인디케이터 */
export function AppShell({
  header,
  footer,
  children,
  className,
  bodyClassName,
  bodyRef,
}: {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  bodyRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div className={cn('flex h-full w-full flex-col bg-white text-black', className)}>
      <StatusBar />
      {header}
      <div ref={bodyRef} className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain', bodyClassName)}>
        {children}
      </div>
      {footer}
      <HomeIndicator />
    </div>
  )
}

export function Avatar({
  initial,
  color,
  size = 40,
  shape = 'circle',
}: {
  initial: string
  color: string
  size?: number
  shape?: 'circle' | 'squircle'
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center font-medium text-white',
        shape === 'circle' ? 'rounded-full' : 'rounded-[38%]',
      )}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initial || (
        <svg viewBox="0 0 24 24" className="size-3/5 fill-white/90">
          <circle cx="12" cy="8" r="4.2" />
          <path d="M3.5 21c.8-4.4 4.3-7 8.5-7s7.7 2.6 8.5 7z" />
        </svg>
      )}
    </span>
  )
}
