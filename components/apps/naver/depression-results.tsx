import { withBasePath } from '@/lib/base-path'

type Result = { source: 'Kafe' | 'Blog' | 'KnowledgeiN'; site: string; date: string; title: string; snippet: string; thumb?: string }

const RESULTS: Result[] = [
  {
    source: 'Blog',
    site: 'Jurnal Hati Sehari-hari',
    date: '3 hari lalu',
    title: '5 hal yang aku lakukan kalau tiba-tiba depresi',
    snippet: 'Ada hari-hari ketika hati tiba-tiba terasa berat tanpa alasan. Kalau lagi begitu, aku jalan-jalan sebentar atau minum teh hangat...',
    thumb: '/images/naver/blog-1.png',
  },
  {
    source: 'Kafe',
    site: 'Ruang Teduh Hati (120 rb anggota)',
    date: '2025.10.30',
    title: 'Akhir-akhir ini aku sedih dan nangis terus tanpa alasan',
    snippet: 'Lagi jalanin hari kayak biasa, tiba-tiba mood langsung anjlok. Kalian biasanya ngapain kalau lagi begini? Komentar 47',
  },
  {
    source: 'KnowledgeiN',
    site: 'Jawaban dokter spesialis kedokteran jiwa',
    date: '2025.08.14',
    title: 'Tiba-tiba rasa sedih datang bertubi-tubi, apakah ini depresi?',
    snippet: 'Penurunan suasana hati sementara perlu dibedakan dari depresi. Jika berlangsung lebih dari 2 minggu, kami sarankan untuk berkonsultasi.',
  },
  {
    source: 'Blog',
    site: 'Penghiburan Kecil',
    date: '1 minggu lalu',
    title: 'Playlist lagu yang enak didengar saat sedih',
    snippet: 'Aku kumpulin lagu-lagu yang pelan-pelan menenangkan hati di malam-malam sendirian. 1. You Were Beautiful 2. Time of Our Life...',
    thumb: '/images/naver/blog-2.png',
  },
  {
    source: 'Kafe',
    site: 'Ruang Curhat Usia 20-an',
    date: '2025.11.02',
    title: 'Saat capek ketemu orang dan tiba-tiba jadi sedih',
    snippet: 'Ada kalanya dichat orang aja rasanya berat, pengin lepasin semuanya. Bukan cuma aku kan yang begini? Komentar 89',
  },
  {
    source: 'Blog',
    site: 'Hari yang Sehat',
    date: '2025.09.21',
    title: 'Checklist tes mandiri depresi (PHQ-9)',
    snippet: 'Coba cek seberapa sering kamu mengalami gejala berikut dalam 2 minggu terakhir. Kalau skornya tinggi, sebaiknya bicarakan dengan ahli...',
  },
]

const SOURCE_COLOR: Record<Result['source'], string> = { Kafe: '#03c75a', Blog: '#20c06b', KnowledgeiN: '#1e88e5' }

export function DepressionResults() {
  return (
    <div className="bg-[#f2f4f6] pb-8">
      <section className="bg-white px-4 py-4" aria-label="Informasi bantuan">
        <p className="text-[14px] font-semibold">Sedang merasa berat?</p>
        <p className="mt-1 text-[13px] leading-relaxed text-black/55">
          Jangan dipendam sendiri. Kamu bisa mendapat bantuan 24 jam di Layanan Krisis Kesehatan Jiwa 109 · Konseling Kesehatan Jiwa 1577-0199.
        </p>
      </section>
      <ul className="mt-2 flex flex-col gap-2">
        {RESULTS.map((r) => (
          <li key={r.title} className="bg-white px-4 py-4">
            <p className="flex items-center gap-1.5 text-[12.5px] text-black/45">
              <span className="font-semibold" style={{ color: SOURCE_COLOR[r.source] }}>
                {r.source}
              </span>
              <span>{r.site}</span>
              <span aria-hidden>·</span>
              <span>{r.date}</span>
            </p>
            <div className="mt-1.5 flex gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-semibold leading-snug text-[#1a0dab]">{r.title}</h3>
                <p className="mt-1 line-clamp-3 text-[13.5px] leading-relaxed text-black/60">{r.snippet}</p>
              </div>
              {r.thumb && (
                <img src={withBasePath(r.thumb)} alt="" className="size-[76px] shrink-0 rounded-[8px] object-cover" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
