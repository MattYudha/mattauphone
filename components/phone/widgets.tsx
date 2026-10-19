import { Navigation, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WeatherWidget() {
  return (
    <section
      aria-label="서울 날씨 8도 맑음"
      className="flex aspect-square flex-col justify-between rounded-[22px] p-3.5 text-white shadow-lg"
      style={{ background: 'linear-gradient(160deg, #3d7fd6 0%, #6aa8ea 100%)' }}
    >
      <div>
        <p className="flex items-center gap-1 text-sm font-semibold">
          서울 <Navigation className="size-3 fill-white" aria-hidden />
        </p>
        <p className="text-[44px] font-light leading-none">8°</p>
      </div>
      <div>
        <Sun className="size-5 fill-[#ffd94d] text-[#ffd94d]" aria-hidden />
        <p className="mt-1 text-sm font-medium">맑음</p>
      </div>
    </section>
  )
}

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarWidget() {
  const year = 2025
  const monthIndex = 10
  const today = 19
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  return (
    <section aria-label="2025년 11월 달력, 오늘 19일" className="flex aspect-square flex-col rounded-[22px] bg-white p-3 text-black shadow-lg">
      <p className="text-[11px] font-bold text-[#ff3b30]">11월</p>
      <div className="mt-1 grid flex-1 grid-cols-7 content-between text-center text-[9px] leading-[1.45]">
        {WEEK.map((w, i) => (
          <span key={w} className={cn('font-semibold', i === 0 ? 'text-[#ff3b30]/70' : 'text-black/45')}>
            {w}
          </span>
        ))}
        {cells.map((d, i) => (
          <span key={i} className="flex items-center justify-center">
            {d && (
              <span
                className={cn(
                  'flex size-[15px] items-center justify-center rounded-full font-medium',
                  d === today && 'bg-[#ff3b30] text-white',
                  d !== today && i % 7 === 0 && 'text-[#ff3b30]/80',
                )}
                aria-current={d === today ? 'date' : undefined}
              >
                {d}
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}
