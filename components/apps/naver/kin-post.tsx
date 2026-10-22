'use client'

import { withBasePath } from '@/lib/base-path'
import { MessageCircle, ThumbsUp, UserRound } from 'lucide-react'

type Answer = { id: string; author: string; level: string; body: string[]; extra?: 'hospital' }

const ANSWERS: Answer[] = [
  {
    id: 'a1',
    author: 'dhdwn29',
    level: 'Rakyat Biasa',
    body: [
      'Penanya kebanyakan ngeladenin dia kali? Cowok itu juga nggak peka sih.... Gimana kalau jadian aja sama orang yang kamu suka',
      'Nggak membantu ya?ㅜㅜ Maaf....',
    ],
  },
  {
    id: 'a2',
    author: 'dudvlftkfkd0101',
    level: 'Rakyat Biasa',
    body: ['Tapi isi postingannya kayak diam-diam pamer kalau dia banyak yang suka deh'],
  },
  {
    id: 'a3',
    author: 'wellknown99',
    level: 'Penjaga',
    body: [
      'Penanya pasti banyak pikiran ya... Di saat seperti itu, mungkin ada baiknya memutus semua hubungan sosial dan meluangkan waktu untuk fokus pada diri sendiri sambil menjalani konseling. Hubungan antarmanusia kan sumber stres terbesar dalam hidup. Kalau Anda menelepon ke nomor yang saya tinggalkan, kami akan melayani dengan ramah kapan saja. Di bawah ini adalah situs rumah sakit konseling kami. Silakan berkunjung kalau ada waktu. ^^ Mohon dipilih sebagai jawaban terbaik juga ya.',
      '02-129-0428',
    ],
    extra: 'hospital',
  },
]

export function KinPost() {
  return (
    <article className="bg-[#f2f4f6] pb-8">
      <header className="flex items-center gap-1.5 bg-white px-4 py-3">
        <span className="text-[19px] font-extrabold tracking-tight text-[#03c75a]">KnowledgeiN</span>
        <span className="text-[13px] text-black/40">· Cinta, Pernikahan</span>
      </header>

      <section className="bg-white px-4 pb-5 pt-2" aria-labelledby="kin-title">
        <h1 id="kin-title" className="flex gap-1.5 text-[19px] font-bold leading-snug">
          <span className="text-[#03c75a]" aria-hidden>
            Q.
          </span>
          Cara blokir cowok yang nggak aku minati gimana???????
        </h1>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.7] text-[#333]">
          Ada cowok yang sama sekali nggak aku minati tapi terus-terusan ngehubungin, aku harus gimana? Serius, chatnya aku
          kacangin dia malah nelpon, telponnya nggak aku angkat pun dia pantang nyerah tetep ngehubungin....;; Aku udah punya
          orang yang aku suka loh? Tapi dia terus godain jadi aku sebel banget...ㅜㅜㅜㅜㅜㅜ Harus gimana ya.... Sebenernya
          dulu juga sering dichat orang yang nggak aku minati, dan tiap kali begitu aku bingung...
        </p>
        <div className="mt-5 flex items-center justify-between text-[12.5px] text-black/45">
          <span>
            <span className="font-medium text-black/70">kimwpil0428</span> · 2025.09.28
          </span>
          <span className="flex items-center gap-3">
            <span>Dilihat 1.284</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" aria-hidden />
              {ANSWERS.length}
            </span>
          </span>
        </div>
      </section>

      <h2 className="px-4 pb-2 pt-5 text-[14px] font-bold text-black/70">
        Jawaban <span className="text-[#03c75a]">{ANSWERS.length}</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {ANSWERS.map((a) => (
          <li key={a.id} className="bg-white px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#e9edf0] text-black/35" aria-hidden>
                <UserRound className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[14px] font-semibold">{a.author}</p>
                <p className="text-[12px] text-black/40">{a.level} · 2025.09.28</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3 text-[15px] leading-[1.7] text-[#333]">
              {a.body.map((p) => (
                <p key={p} className={p.startsWith('02-') ? 'font-semibold' : undefined}>
                  {p}
                </p>
              ))}
            </div>
            {a.extra === 'hospital' && <HospitalLink />}
            <div className="mt-4 flex items-center gap-1 text-[12.5px] text-black/40">
              <ThumbsUp className="size-3.5" aria-hidden />
              {a.id === 'a3' ? 3 : a.id === 'a1' ? 1 : 7}
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function HospitalLink() {
  return (
    <div className="mt-4 overflow-hidden rounded-[10px] border border-black/10">
      <img
        src={withBasePath('/images/naver/hospital.png')}
        alt="Foto ruang konseling RS Konseling Joeun Eulji"
        className="aspect-[2/1] w-full object-cover"
      />
      <div className="px-3 py-2.5">
        <p className="text-[14px] font-semibold">RS Konseling Joeun Eulji - Tempat hati jadi tenang</p>
        <p className="mt-0.5 line-clamp-2 text-[12.5px] text-black/50">
          Konseling psikologi · Klinik stres · Konseling telepon 24 jam 02-129-0428
        </p>
        <p className="mt-1 text-[12px] text-[#03c75a]">www.joeun-eulji.co.kr</p>
      </div>
    </div>
  )
}
