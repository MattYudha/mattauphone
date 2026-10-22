'use client'

import { useState } from 'react'
import { ChevronLeft, Search, SquarePen } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'

type Note = { id: string; title: string; date: string; body: string }

const NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Terus aku harus gimana sih',
    date: '17.42',
    body: 'Terus aku harus gimana sih\n\nAku nggak ngerti lagi aku harus gimana. Aku harus melenceng kayak apa lagi biar dia mau ngelihat aku? Maksa ketemuan sama orang yang bahkan nggak aku suka juga kayaknya udah sampai batasnya. Kim Wonpil, kamu kurang apa sih sampai masih aja suka sama cowok yang bahkan nggak suka balik sama kamu. Kang Younghyun toh nggak suka sama kamu. Dia nggak mau sama kamu. Emangnya mau dapet apa sih dari semua ini..........',
  },
  {
    id: 'n2',
    title: 'Catatan lirik',
    date: 'Kemarin',
    body: 'Catatan lirik\n\nKalau aku bilang aku baik-baik saja\napa aku akan benar-benar baik-baik saja\n\nPura-pura tak terjadi apa-apa\nhari ini pun aku tetap tersenyum\n\n→ benerin lagi melodi reff',
  },
  {
    id: 'n3',
    title: 'To-do',
    date: 'Kemarin',
    body: 'To-do\nBuang semua celana dalam Park Hyunseong\nBuang juga semua hadiah dari Park Hyunseong\nBeresin chat KakaoTalk sama SMS dong Kim Wonpil ㅜㅜ',
  },
  {
    id: 'n5',
    title: 'Film yang pengin ditonton',
    date: '02/10/25',
    body: 'Film yang pengin ditonton\n\n1. Begin Again (lagi)\n2. Once\n3. About Time (pengin nonton bareng Younghyun hyung)\n\nNonton sendirian juga nggak apa-apa',
  },
]

export function NotesApp() {
  const [openId, setOpenId] = useState<string | null>(null)
  const note = NOTES.find((n) => n.id === openId)
  useBackHandler(!!note, () => setOpenId(null))

  return (
    <div className="flex h-full flex-col bg-[#f2f2f7] text-black">
      <StatusBar />
      {note ? <NoteDetail note={note} onBack={() => setOpenId(null)} /> : <NoteList onOpen={setOpenId} />}
      <HomeIndicator className="bg-[#f2f2f7]" />
    </div>
  )
}

function NoteList({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <h1 className="pt-10 text-[32px] font-bold tracking-tight">Catatan</h1>
        <div className="mt-2 flex items-center gap-2 rounded-[10px] bg-black/[0.06] px-2.5 py-2 text-[16px] text-black/40" aria-hidden>
          <Search className="size-4" />
          Cari
        </div>
        <ul className="mt-5 overflow-hidden rounded-[12px] bg-white">
          {NOTES.map((n, i) => {
            const preview = n.body.split('\n').filter(Boolean)[1] ?? ''
            return (
              <li key={n.id} className={i > 0 ? 'ml-4 border-t border-black/10' : undefined}>
                <button type="button" onClick={() => onOpen(n.id)} className="w-full py-2.5 pr-4 text-left active:bg-black/5 [&:not(:first-child)]:pl-0">
                  <span className={i === 0 ? 'block px-4' : 'block'}>
                    <span className="block truncate text-[16px] font-semibold">{n.title}</span>
                    <span className="mt-0.5 flex gap-2 text-[14px] text-black/45">
                      <span className="shrink-0">{n.date}</span>
                      <span className="truncate">{preview}</span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex shrink-0 items-center justify-between px-5 py-2">
        <span className="w-6" />
        <span className="text-[12px] text-black/60">{`${NOTES.length} Catatan`}</span>
        <SquarePen className="size-6 text-[#e5a500]" aria-hidden />
      </div>
    </>
  )
}

function NoteDetail({ note, onBack }: { note: Note; onBack: () => void }) {
  const [title, ...rest] = note.body.split('\n')
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex items-center px-2 py-2">
        <button type="button" onClick={onBack} className="flex items-center text-[17px] text-[#e5a500]">
          <ChevronLeft className="size-7" aria-hidden />
          Catatan
        </button>
      </div>
      <article className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <p className="text-center text-[12px] text-black/40">{note.date}</p>
        <h1 className="mt-3 text-[24px] font-bold">{title}</h1>
        <p className="mt-2 whitespace-pre-line text-[17px] leading-relaxed">{rest.join('\n').trimStart()}</p>
      </article>
    </div>
  )
}
