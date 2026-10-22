import { withBasePath } from '@/lib/base-path'
import { ArrowLeftRight, CalendarDays, Plane, UserRound } from 'lucide-react'

const ROUTES = [
  { from: 'Vancouver YVR', to: 'Incheon ICN', time: '± 11 jam 15 mnt', note: 'Langsung' },
  { from: 'Toronto YYZ', to: 'Incheon ICN', time: '± 13 jam 50 mnt', note: 'Langsung' },
  { from: 'Montreal YUL', to: 'Incheon ICN', time: '± 17 jam 30 mnt', note: '1x transit' },
]

const FARES = [
  { airline: 'Korean Air', time: '13.20 → 16.35 (+1)', duration: '11 jam 15 mnt', price: '₩1.284.000' },
  { airline: 'Air Canada', time: '12.05 → 15.30 (+1)', duration: '11 jam 25 mnt', price: '₩1.159.800' },
  { airline: 'Asiana Airlines', time: '14.30 → 17.50 (+1)', duration: '11 jam 20 mnt', price: '₩1.231.500' },
]

export function FlightResults() {
  return (
    <div className="bg-[#f2f4f6] pb-8">
      <section className="bg-white px-4 pb-5 pt-4" aria-labelledby="flight-time">
        <p className="text-[13px] text-black/45">Lama penerbangan Kanada → Korea</p>
        <p id="flight-time" className="mt-1 text-[26px] font-bold tracking-tight">
          ± 11–14 jam
        </p>
        <p className="text-[13px] text-black/50">Untuk penerbangan langsung · Tergantung kota keberangkatan</p>
        <img
          src={withBasePath('/images/naver/flight-map.png')}
          alt="Peta rute penerbangan dari Kanada melintasi Samudra Pasifik ke Incheon"
          className="mt-4 aspect-[16/9] w-full rounded-[10px] object-cover"
        />
        <ul className="mt-4 divide-y divide-black/[0.06]">
          {ROUTES.map((r) => (
            <li key={r.from} className="flex items-center justify-between py-2.5 text-[14px]">
              <span className="flex items-center gap-1.5">
                {r.from}
                <Plane className="size-3.5 text-[#03c75a]" aria-hidden />
                {r.to}
              </span>
              <span className="text-right">
                <span className="font-semibold">{r.time}</span>
                <span className="ml-1.5 text-[12px] text-black/40">{r.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-2 bg-white px-4 py-5" aria-labelledby="flight-booking">
        <h2 id="flight-booking" className="flex items-center gap-1.5 text-[16px] font-bold">
          <span className="text-[#03c75a]">N</span> Pesan Tiket Pesawat
        </h2>
        <div className="mt-3 rounded-[12px] border border-black/10">
          <div className="flex items-center justify-between px-4 py-3">
            <span>
              <span className="block text-[12px] text-black/40">Berangkat</span>
              <span className="text-[17px] font-bold">YVR</span> <span className="text-[13px]">Vancouver</span>
            </span>
            <ArrowLeftRight className="size-4 text-black/40" aria-hidden />
            <span className="text-right">
              <span className="block text-[12px] text-black/40">Tiba</span>
              <span className="text-[13px]">Incheon</span> <span className="text-[17px] font-bold">ICN</span>
            </span>
          </div>
          <div className="flex divide-x divide-black/10 border-t border-black/10 text-[14px]">
            <span className="flex flex-1 items-center gap-1.5 px-4 py-2.5">
              <CalendarDays className="size-4 text-black/40" aria-hidden />
              Rab, 26 Nov · Sekali jalan
            </span>
            <span className="flex flex-1 items-center gap-1.5 px-4 py-2.5">
              <UserRound className="size-4 text-black/40" aria-hidden />
              1 Dewasa · Ekonomi
            </span>
          </div>
        </div>
        <button type="button" className="mt-3 w-full rounded-[10px] bg-[#03c75a] py-3 text-[15px] font-bold text-white">
          Cari Tiket
        </button>
        <ul className="mt-4 flex flex-col gap-2">
          {FARES.map((f) => (
            <li key={f.airline} className="flex items-center justify-between rounded-[10px] bg-[#f7f8fa] px-3 py-3">
              <span>
                <span className="block text-[14px] font-semibold">{f.airline}</span>
                <span className="text-[12.5px] text-black/50">
                  {f.time} · {f.duration}
                </span>
              </span>
              <span className="text-[15px] font-bold text-[#f04f4f]">{f.price}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
