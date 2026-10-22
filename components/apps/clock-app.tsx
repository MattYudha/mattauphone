'use client'

import { AlarmClock, Globe, Plus, Timer, Watch } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useStory } from '@/lib/story/store'

const STORY_DATE = '2025-11-19'
const HOME_TZ = 'Asia/Seoul'

const CITIES = [
  { city: 'Seoul', tz: 'Asia/Seoul' },
  { city: 'Toronto', tz: 'America/Toronto' },
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

/** Mengonversi waktu acuan yang sama ke zona waktu kota (DST sudah ditangani data zona waktu Intl) */
function cityTime(clock: string, tz: string) {
  // Jam cerita ditampilkan gaya Indonesia ("18.58"); ISO butuh titik dua.
  const base = new Date(`${STORY_DATE}T${clock.replace('.', ':')}:00+09:00`)
  const home = partsIn(base, HOME_TZ)
  const local = partsIn(base, tz)
  const homeMin = Date.UTC(home.y, home.mo - 1, home.d, home.h, home.m) / 60000
  const localMin = Date.UTC(local.y, local.mo - 1, local.d, local.h, local.m) / 60000
  const diffH = Math.round((localMin - homeMin) / 60)
  const dayDiff = Math.round(
    (Date.UTC(local.y, local.mo - 1, local.d) - Date.UTC(home.y, home.mo - 1, home.d)) / 86400000,
  )
  const day = dayDiff === 0 ? 'Hari ini' : dayDiff < 0 ? 'Kemarin' : 'Besok'
  const label = `${day}, ${diffH >= 0 ? '+' : ''}${diffH} jam`
  const hh = local.h
  const time = `${String(hh).padStart(2, '0')}.${String(local.m).padStart(2, '0')}`
  return { label, time }
}

export function ClockApp() {
  const { clock } = useStory()
  return (
    <div className="flex h-full flex-col bg-black text-white">
      <StatusBar tone="light" />
      <div className="flex justify-between px-4 py-2 text-[17px] text-[#ff9f0a]" aria-hidden>
        <span>Edit</span>
        <Plus className="size-6" />
      </div>
      <h1 className="px-4 pb-2 text-[34px] font-bold">Jam Dunia</h1>
      <ul className="min-h-0 flex-1 overflow-y-auto px-4">
        {CITIES.map((c) => {
          const { label, time } = cityTime(clock, c.tz)
          return (
            <li key={c.city} className="flex items-end justify-between border-b border-white/15 py-3">
              <span>
                <span className="block text-[13px] text-white/50">{label}</span>
                <span className="block text-[24px]">{c.city}</span>
              </span>
              <span className="text-[50px] font-light leading-none tabular-nums">
                {time}
              </span>
            </li>
          )
        })}
      </ul>
      <nav aria-hidden className="grid grid-cols-4 border-t border-white/10 py-2 text-center text-[10px] text-white/45">
        <span className="flex flex-col items-center gap-0.5 text-[#ff9f0a]">
          <Globe className="size-6" />
          Jam Dunia
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <AlarmClock className="size-6" />
          Alarm
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <Watch className="size-6" />
          Stopwatch
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <Timer className="size-6" />
          Timer
        </span>
      </nav>
      <HomeIndicator tone="light" className="bg-black" />
    </div>
  )
}
