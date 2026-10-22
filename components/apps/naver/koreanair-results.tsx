import { ChevronRight, ExternalLink, Plane, Search, Ticket } from 'lucide-react'

const HOME = 'https://www.koreanair.com'

const GUIDES = [
  { label: 'Pesan Tiket', desc: 'Cari dan pesan tiket penerbangan domestik & internasional', icon: Plane },
  { label: 'Cek Pemesanan', desc: 'Lihat dan ubah perjalanan dengan nomor pemesanan', icon: Search },
  { label: 'Check-in', desc: 'Check-in online & mobile serta terbitkan boarding pass', icon: Ticket },
]

export function KoreanAirResults() {
  return (
    <div className="bg-[#f1f3f5] pb-4">
      <section className="bg-white px-4 py-4" aria-labelledby="ke-result">
        <p className="text-[12px] text-black/45">Situs resmi</p>
        <a href={HOME} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#00256c]" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-7">
              <circle cx="12" cy="12" r="10" fill="#fff" />
              <path d="M2.3 11a10 10 0 0 1 19.4 0c-3-2.6-6.3-2.6-9.7 0s-6.7 2.6-9.7 0Z" fill="#c8102e" />
              <path d="M21.7 13a10 10 0 0 1-19.4 0c3 2.6 6.3 2.6 9.7 0s6.7-2.6 9.7 0Z" fill="#0064de" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span id="ke-result" className="flex items-center gap-1 text-[18px] font-bold text-[#0068c3]">
              Korean Air
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">(jendela baru)</span>
            </span>
            <span className="block truncate text-[13px] text-[#00a33b]">{HOME}</span>
          </span>
        </a>
        <p className="mt-2 text-[13.5px] leading-snug text-black/60">
          Situs resmi Korean Air, maskapai nasional Korea Selatan. Pesan tiket, cek pemesanan, check-in, hingga kelola mil SKYPASS di sini.
        </p>
        <ul className="mt-3 divide-y divide-black/[0.06] rounded-[10px] border border-black/[0.08]">
          {GUIDES.map(({ label, desc, icon: Icon }) => (
            <li key={label}>
              <a
                href={HOME}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 active:bg-black/5"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#00256c]/[0.08]" aria-hidden>
                  <Icon className="size-[18px] text-[#00256c]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{label}</span>
                  <span className="block text-[12.5px] text-black/45">{desc}</span>
                </span>
                <ChevronRight className="size-4 text-black/25" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-2 bg-white px-4 py-4">
        <h2 className="text-[17px] font-bold">Pencarian terkait</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-[13px] text-black/70">
          {['check-in Korean Air', 'cek pemesanan Korean Air', 'mil Korean Air', 'customer service Korean Air'].map((t) => (
            <li key={t} className="rounded-full bg-[#f1f3f5] px-3 py-1.5">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
