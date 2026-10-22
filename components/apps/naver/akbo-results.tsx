import { ChevronRight, Music } from 'lucide-react'

export const SCORES = [
  { title: 'Spring Day (Bom Nal)', artist: 'BTS', level: 'Menengah', pages: 5, inst: 'Piano' },
  { title: 'Canon in D', artist: 'Pachelbel', level: 'Pemula', pages: 3, inst: 'Piano' },
  { title: 'Meaning of You (Neoui Uimi)', artist: 'IU', level: 'Menengah', pages: 4, inst: 'Piano' },
  { title: 'Time of Our Life (Han Peijiga Doel Su Itge)', artist: 'DAY6', level: 'Menengah', pages: 6, inst: 'Partitur Band' },
  { title: 'Moonlight Sonata Gerakan 1', artist: 'Beethoven', level: 'Mahir', pages: 6, inst: 'Piano' },
  { title: 'You Were Beautiful (Yeppeosseo)', artist: 'DAY6', level: 'Pemula', pages: 4, inst: 'Kord Gitar' },
]

function AkboMark({ className = 'size-11' }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-[10px] bg-[#1f2a44] ${className}`} aria-hidden>
      <Music className="size-[55%] text-[#f6c453]" />
    </span>
  )
}

export function AkboResults({ onOpenSite }: { onOpenSite: () => void }) {
  return (
    <div className="bg-[#f1f3f5] pb-4">
      <section className="bg-white px-4 py-4" aria-labelledby="akbo-result">
        <p className="text-[12px] text-black/45">Situs</p>
        <button type="button" onClick={onOpenSite} className="mt-2 flex w-full items-center gap-3 text-left">
          <AkboMark />
          <span className="min-w-0 flex-1">
            <span id="akbo-result" className="block text-[18px] font-bold text-[#0068c3]">
              Akbo Segye
            </span>
            <span className="block truncate text-[13px] text-[#00a33b]">Akbo Segye · Partitur piano·band·gitar</span>
          </span>
        </button>
        <p className="mt-2 text-[13.5px] leading-snug text-black/60">
          Partitur K-pop, klasik, sampai OST sesuai tingkat kesulitan, semua di satu tempat. Cek partiturnya lewat pratinjau, lalu langsung latihan.
        </p>
        <ul className="mt-3 divide-y divide-black/[0.06] rounded-[10px] border border-black/[0.08]">
          {SCORES.slice(0, 3).map((s) => (
            <li key={s.title}>
              <button type="button" onClick={onOpenSite} className="flex w-full items-center gap-3 px-3 py-2.5 text-left active:bg-black/5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold">{s.title}</span>
                  <span className="block text-[12.5px] text-black/45">{`${s.artist} · ${s.inst} · ${s.level}`}</span>
                </span>
                <ChevronRight className="size-4 text-black/25" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-2 bg-white px-4 py-4">
        <h2 className="text-[17px] font-bold">Pencarian terkait</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-[13px] text-black/70">
          {['Akbo Segye piano', 'partitur piano gratis', 'partitur band DAY6', 'partitur piano pemula'].map((t) => (
            <li key={t} className="rounded-full bg-[#f1f3f5] px-3 py-1.5">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function AkboSite() {
  return (
    <div className="min-h-full bg-[#fafaf7] pb-6">
      <header className="flex items-center gap-2.5 bg-[#1f2a44] px-4 py-3.5 text-white">
        <AkboMark className="size-8 bg-white/10" />
        <h1 className="text-[18px] font-bold">Akbo Segye</h1>
      </header>
      <div className="px-4 pt-4">
        <h2 className="text-[16px] font-bold">Partitur Populer</h2>
        <ul className="mt-3 space-y-2.5">
          {SCORES.map((s, i) => (
            <li key={s.title} className="flex items-center gap-3 rounded-[12px] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="w-5 text-center text-[15px] font-bold text-[#1f2a44]">{i + 1}</span>
              <span className="flex h-14 w-11 shrink-0 flex-col justify-center gap-[3px] rounded-[4px] border border-black/10 bg-white px-1.5" aria-hidden>
                {[0, 1, 2, 3, 4].map((l) => (
                  <span key={l} className="h-px bg-black/30" />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{s.title}</span>
                <span className="block text-[12.5px] text-black/50">{s.artist}</span>
                <span className="mt-1 flex gap-1.5 text-[11px]">
                  <span className="rounded-[4px] bg-[#f6c453]/25 px-1.5 py-0.5 text-[#8a6500]">{s.inst}</span>
                  <span className="rounded-[4px] bg-black/[0.05] px-1.5 py-0.5 text-black/55">{s.level}</span>
                  <span className="rounded-[4px] bg-black/[0.05] px-1.5 py-0.5 text-black/55">{`${s.pages} hlm`}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
