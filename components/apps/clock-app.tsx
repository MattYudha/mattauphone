'use client'

import { AlarmClock, Globe, Plus, Timer, Watch } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useStory } from '@/lib/story/store'

const STORY_DATE = '2025-11-19'
const HOME_TZ = 'Asia/Seoul'

const CITIES = [
  { city: '서울', tz: 'Asia/Seoul' },
  { city: '토론토', tz: 'America/Toronto' },
]

function partsIn(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), m: get('minute') }
}

/** 같은 기준 시각을 도시 시간대로 변환 (서머타임은 Intl 시간대 데이터가 반영) */
function cityTime(clock: string, tz: string) {
  const base = new Date(`${STORY_DATE}T${clock}:00+09:00`)
  const home = partsIn(base, HOME_TZ)
  const local = partsIn(base, tz)
  const homeMin = Date.UTC(home.y, home.mo - 1, home.d, home.h, home.m) / 60000
  const localMin = Date.UTC(local.y, local.mo - 1, local.d, local.h, local.m) / 60000
  const diffH = Math.round((localMin - homeMin) / 60)
  const dayDiff = Math.round(
    (Date.UTC(local.y, local.mo - 1, local.d) - Date.UTC(home.y, home.mo - 1, home.d)) / 86400000,
  )
  const day = dayDiff === 0 ? '오늘' : dayDiff < 0 ? '어제' : '내일'
  const label = `${day}, ${diffH >= 0 ? '+' : ''}${diffH}시간`
  const hh = local.h
  const time = `${hh < 12 ? '오전' : '오후'} ${hh % 12 === 0 ? 12 : hh % 12}:${String(local.m).padStart(2, '0')}`
  return { label, time }
}

export function ClockApp() {
  const { clock } = useStory()
  return (
    <div className="flex h-full flex-col bg-black text-white">
      <StatusBar tone="light" />
      <div className="flex justify-between px-4 py-2 text-[17px] text-[#ff9f0a]" aria-hidden>
        <span>편집</span>
        <Plus className="size-6" />
      </div>
      <h1 className="px-4 pb-2 text-[34px] font-bold">세계 시계</h1>
      <ul className="min-h-0 flex-1 overflow-y-auto px-4">
        {CITIES.map((c) => {
          const { label, time: full } = cityTime(clock, c.tz)
          const [ampm, time] = full.split(' ')
          return (
            <li key={c.city} className="flex items-end justify-between border-b border-white/15 py-3">
              <span>
                <span className="block text-[13px] text-white/50">{label}</span>
                <span className="block text-[24px]">{c.city}</span>
              </span>
              <span className="text-[50px] font-light leading-none tabular-nums">
                <span className="mr-1 text-[22px]">{ampm}</span>
                {time}
              </span>
            </li>
          )
        })}
      </ul>
      <nav aria-hidden className="grid grid-cols-4 border-t border-white/10 py-2 text-center text-[10px] text-white/45">
        <span className="flex flex-col items-center gap-0.5 text-[#ff9f0a]">
          <Globe className="size-6" />
          세계 시계
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <AlarmClock className="size-6" />
          알람
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <Watch className="size-6" />
          스톱워치
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <Timer className="size-6" />
          타이머
        </span>
      </nav>
      <HomeIndicator tone="light" className="bg-black" />
    </div>
  )
}
