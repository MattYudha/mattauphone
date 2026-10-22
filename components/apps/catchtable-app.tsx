'use client'

import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'

type Reservation = {
  id: string
  name: string
  cuisine: string
  date: string
  time: string
  party: number
  area: string
  seat: string
  number: string
  request: string
  photo: string
  photoAlt: string
}

const RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    name: 'Sushi Haruka',
    cuisine: 'Jepang · Omakase Sushi',
    date: 'Sab, 8 November 2025',
    time: '19.00',
    party: 2,
    area: 'Seoul Gangnam-gu · Sinsa-dong',
    seat: 'Kursi konter',
    number: 'CT2511080712',
    request: 'Paket omakase makan malam',
    photo: '/images/catchtable/sushi-haruka.jpg',
    photoAlt: 'Salmon avocado roll di atas talenan kayu dengan mangkuk kecil kecap asin',
  },
  {
    id: 'r2',
    name: 'Trattoria Luce',
    cuisine: 'Barat · Italia',
    date: 'Sab, 25 Oktober 2025',
    time: '18.30',
    party: 2,
    area: 'Seoul Yongsan-gu · Hannam-dong',
    seat: 'Meja dekat jendela',
    number: 'CT2510251834',
    request: 'Paket pasta · Tanpa wine pairing',
    photo: '/images/catchtable/trattoria-luce.jpg',
    photoAlt: 'Hidangan tertata di meja dengan gelas wine dan keranjang roti',
  },
]

const TABS = ['Akan Datang', 'Selesai', 'Batal/No-show'] as const
type Tab = (typeof TABS)[number]

export function CatchTableApp() {
  const [tab, setTab] = useState<Tab>('Selesai')
  const [openId, setOpenId] = useState<string | null>(null)
  useBackHandler(openId !== null, () => setOpenId(null))
  const open = RESERVATIONS.find((r) => r.id === openId)

  return (
    <div className="flex h-full flex-col bg-[#f5f5f7] text-[#111]">
      <StatusBar />
      {open ? (
        <Detail r={open} onBack={() => setOpenId(null)} />
      ) : (
        <>
          <header className="shrink-0 bg-white px-4 pb-0 pt-2">
            <h1 className="text-[22px] font-bold">Reservasi Saya</h1>
            <div role="tablist" aria-label="Status reservasi" className="mt-3 flex">
              {TABS.map((t) => {
                const count = t === 'Selesai' ? RESERVATIONS.length : 0
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 border-b-2 pb-2.5 text-[15px]',
                      tab === t ? 'border-[#ff4d2d] font-bold text-[#111]' : 'border-transparent text-black/40',
                    )}
                  >
                    {`${t} ${count}`}
                  </button>
                )
              })}
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {tab === 'Selesai' ? (
              <ul className="space-y-3">
                {RESERVATIONS.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="flex w-full items-center gap-3 rounded-[14px] bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:bg-black/[0.03]"
                    >
                      <img
                        src={withBasePath(r.photo)}
                        alt=""
                        className="size-16 shrink-0 rounded-[12px] object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="inline-block rounded-[4px] bg-black/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-black/55">
                          Selesai
                        </span>
                        <span className="mt-1 block truncate text-[16px] font-bold">{r.name}</span>
                        <span className="block text-[13px] text-black/50">{r.cuisine}</span>
                        <span className="mt-0.5 block text-[13px] text-black/70">{`${r.date} ${r.time} · ${r.party} orang`}</span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-black/25" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center pt-24 text-center">
                <CalendarDays className="size-10 text-black/20" aria-hidden />
                <p className="mt-3 text-[15px] font-semibold text-black/60">{`Belum ada reservasi "${tab}"`}</p>
              </div>
            )}
          </div>
        </>
      )}
      <HomeIndicator className="bg-[#f5f5f7]" />
    </div>
  )
}

function Detail({ r, onBack }: { r: Reservation; onBack: () => void }) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <CalendarDays className="size-4" />, label: 'Tanggal', value: r.date },
    { icon: <Clock className="size-4" />, label: 'Waktu', value: r.time },
    { icon: <Users className="size-4" />, label: 'Jumlah', value: `${r.party} orang` },
    { icon: <MapPin className="size-4" />, label: 'Lokasi', value: r.area },
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center bg-white px-2 py-2">
        <button type="button" onClick={onBack} aria-label="Kembali ke daftar reservasi" className="p-1">
          <ChevronLeft className="size-7" />
        </button>
        <h1 className="flex-1 pr-9 text-center text-[17px] font-semibold">Detail Reservasi</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <img src={withBasePath(r.photo)} alt={r.photoAlt} className="aspect-[16/10] w-full object-cover" />
        <section className="bg-white px-5 pb-5 pt-4">
          <span className="inline-block rounded-[4px] bg-black/[0.06] px-1.5 py-0.5 text-[12px] font-semibold text-black/55">
            Selesai
          </span>
          <h2 className="mt-2 text-[22px] font-bold">{r.name}</h2>
          <p className="text-[14px] text-black/50">{r.cuisine}</p>
          <dl className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 text-[15px]">
                <dt className="flex w-24 items-center gap-1.5 text-black/45">
                  <span aria-hidden>{row.icon}</span>
                  {row.label}
                </dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mt-2 bg-white px-5 py-4">
          <h3 className="text-[15px] font-bold">Info Reservasi</h3>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            {[
              ['No. Reservasi', r.number],
              ['Tempat Duduk', r.seat],
              ['Menu', r.request],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-black/45">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="px-5 py-4 text-[12.5px] text-black/40">Reservasi ini sudah selesai dikunjungi.</p>
      </div>
    </div>
  )
}
