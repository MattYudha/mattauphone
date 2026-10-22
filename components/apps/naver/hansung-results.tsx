import { Clock, MapPin, Phone, Star } from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

const HOURS = [
  ['Sen–Jum', '11.30 - 22.00'],
  ['Sab·Min', '12.00 - 21.30'],
  ['Jam istirahat', '15.00 - 17.00'],
  ['Pesanan terakhir', '21.00'],
]

const BLOGS = [
  {
    author: 'Keseharian Pekerja Kantoran Doyan Makan',
    date: '2025.11.12.',
    title: 'Hansung Sushi, sushi enak dekat Stasiun Gangnam: review menu spesial makan siang',
    body: 'Netanya tebal dan suhu nasinya pas banget. Menu spesial makan siangnya worth it banget sama harganya, sampai udah tiga kali ke sini bareng rekan kantor...',
    img: '/images/naver/sushi-1.png',
  },
  {
    author: 'Catatan Kuliner Seoul',
    date: '2025.11.03.',
    title: '[Gangnam] Review jujur omakase lunch Hansung Sushi',
    body: 'Suka banget karena chef-nya jelasin satu per satu, sirip halibut dan perut tunanya lumer di mulut. 100% bakal balik lagi.',
    img: '/images/naver/sushi-2.png',
  },
]

const CAFES = [
  { cafe: 'Jelajah Kuliner Gangnam', title: 'Jam buka Hansung Sushi ganti ya?', body: 'Hari kerja sampai jam 22.00, jam istirahat 15.00–17.00. Malam hari suka antre, jadi mending reservasi dulu!', date: '2025.11.15.' },
  { cafe: 'Komunitas Makan Siang Pekerja', title: 'Minta rekomendasi tempat sushi dekat Stasiun Gangnam dong', body: 'Rekomen banget Hansung Sushi. Sushi salmon sama belutnya enak parah, pemiliknya juga ramah ㅎㅎ', date: '2025.11.08.' },
  { cafe: 'Rute Kencan Seoul', title: 'Makan malam anniversary di Hansung Sushi', body: 'Suasana kursi counter-nya enak, terus dikasih dessert gratis juga, terharu banget. Bintang 5 deh.', date: '2025.10.29.' },
]

export function HansungResults() {
  return (
    <div className="bg-[#f1f3f5] pb-4">
      <section className="bg-white" aria-labelledby="hansung-title">
        <img src={withBasePath('/images/naver/hansung-map.png')} alt="Peta lokasi Hansung Sushi" className="aspect-[16/9] w-full object-cover" />
        <div className="px-4 pb-4 pt-3">
          <div className="flex items-baseline gap-1.5">
            <h2 id="hansung-title" className="text-[20px] font-bold text-[#0068c3]">
              Hansung Sushi
            </h2>
            <span className="text-[13px] text-black/45">Sushi, Roll</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13.5px] text-black/60">
            <span className="flex items-center gap-0.5 font-semibold text-black">
              <Star fill="currentColor" className="size-3.5 fill-[#ff5c3a] text-[#ff5c3a]" aria-hidden />
              4.8
            </span>
            <span>Ulasan pengunjung 1.284</span>
            <span>Ulasan blog 562</span>
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[12px] text-black/70" aria-hidden>
            {['Dari sini', 'Ke sini', 'Simpan', 'Bagikan'].map((t) => (
              <span key={t} className="rounded-lg border border-black/10 py-2">
                {t}
              </span>
            ))}
          </div>
          <ul className="mt-4 flex flex-col gap-3 text-[14px]">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-black/40" aria-hidden />
              <span>
                Lt. 1, 30 Gangnam-daero 102-gil, Gangnam-gu, Seoul
                <span className="block text-[12.5px] text-black/45">286 m dari Pintu Keluar 11 Stasiun Gangnam</span>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-black/40" aria-hidden />
              <span className="flex-1">
                <span className="font-semibold text-[#03c75a]">Buka</span>
                <span className="text-black/60"> · Tutup pukul 22.00</span>
                <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
                  {HOURS.map(([d, h]) => (
                    <div key={d} className="contents">
                      <dt className="text-black/50">{d}</dt>
                      <dd>{h}</dd>
                    </div>
                  ))}
                </dl>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-black/40" aria-hidden />
              <span>02-555-7812</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-2 bg-white px-4 py-4" aria-labelledby="hansung-blog">
        <h2 id="hansung-blog" className="text-[17px] font-bold">
          Blog
        </h2>
        <ul className="mt-2 divide-y divide-black/[0.06]">
          {BLOGS.map((b) => (
            <li key={b.title} className="flex gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-black/45">
                  {b.author} · {b.date}
                </p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-[#0068c3]">{b.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-black/60">{b.body}</p>
              </div>
              <img src={withBasePath(b.img)} alt="" className="size-[84px] shrink-0 rounded-lg object-cover" />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-2 bg-white px-4 py-4" aria-labelledby="hansung-cafe">
        <h2 id="hansung-cafe" className="text-[17px] font-bold">
          Kafe
        </h2>
        <ul className="mt-2 divide-y divide-black/[0.06]">
          {CAFES.map((c) => (
            <li key={c.title} className="py-3">
              <p className="text-[12px] text-black/45">
                {c.cafe} · {c.date}
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-[#0068c3]">{c.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-black/60">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
