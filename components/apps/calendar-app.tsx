'use client'

import { useState } from 'react'
import { ChevronLeft, Inbox, Plus, Search } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { cn } from '@/lib/utils'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = 19

const EVENTS: Record<number, { time: string; title: string; color: string }[]> = {
  2: [{ time: '하루 종일', title: '영현이형입국❤️', color: '#ff2d55' }],
  7: [{ time: '하루 종일', title: '원장 회의', color: '#34c759' }],
  14: [{ time: '19:00', title: '학원 설명회', color: '#ff9500' }],
  19: [
    { time: '10:00', title: '유치원부 오전 수업', color: '#0a84ff' },
    { time: '19:00', title: '퇴근', color: '#af52de' },
  ],
  22: [{ time: '12:00', title: '점심 약속', color: '#ff2d55' }],
  28: [{ time: '하루 종일', title: '월말 정산', color: '#34c759' }],
}

export function CalendarApp() {
  const [selected, setSelected] = useState(TODAY)
  const firstDay = new Date(Date.UTC(2025, 10, 1)).getUTCDay()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)]
  const events = EVENTS[selected] ?? []

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar />
      <div className="flex items-center justify-between px-3 py-1 text-[17px] text-[#ff3b30]">
        <span className="flex items-center" aria-hidden>
          <ChevronLeft className="size-6" />
          2025년
        </span>
        <span className="flex gap-5" aria-hidden>
          <Search className="size-5" />
          <Plus className="size-6" />
        </span>
      </div>
      <h1 className="px-4 pb-2 pt-1 text-[32px] font-bold">11월</h1>
      <div className="grid grid-cols-7 border-b border-black/10 px-2 pb-1 text-center text-[12px] text-black/45">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 px-2 pt-1 text-center">
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={selected === d}
              aria-label={`11월 ${d}일${EVENTS[d] ? `, 일정 ${EVENTS[d].length}개` : ''}`}
              className="flex h-12 flex-col items-center justify-start gap-0.5 border-t border-black/[0.06] pt-1"
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-[18px]',
                  i % 7 === 0 && 'text-black/45',
                  d === TODAY && 'text-[#ff3b30] font-semibold',
                  selected === d && (d === TODAY ? 'bg-[#ff3b30] text-white' : 'bg-black text-white'),
                )}
              >
                {d}
              </span>
              {EVENTS[d] && <span className="size-1.5 rounded-full bg-black/30" aria-hidden />}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
      <section aria-label={`11월 ${selected}일 일정`} className="mt-2 min-h-0 flex-1 overflow-y-auto border-t border-black/10 px-4 pt-3">
        {events.length === 0 ? (
          <p className="pt-6 text-center text-[15px] text-black/40">일정 없음</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((e) => (
              <li key={e.title} className="flex items-stretch gap-3">
                <span className="w-1 rounded-full" style={{ backgroundColor: e.color }} aria-hidden />
                <span className="flex-1 py-0.5">
                  <span className="block text-[16px] font-medium">{e.title}</span>
                  <span className="block text-[13px] text-black/45">{e.time}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex justify-between border-t border-black/10 px-5 py-2.5 text-[16px] text-[#ff3b30]" aria-hidden>
        <span>오늘</span>
        <span>캘린더</span>
        <Inbox className="size-5" />
      </div>
      <HomeIndicator />
    </div>
  )
}
