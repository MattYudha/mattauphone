'use client'

import { useState } from 'react'
import { ChevronLeft, Search, SquarePen } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'

type Note = { id: string; title: string; date: string; body: string }

const NOTES: Note[] = [
  {
    id: 'n1',
    title: '나보고 뭐 어떡하라는 건지',
    date: '오후 5:42',
    body: '나보고 뭐 어떡하라는 건지\n\n나보고 뭐 어떡하라는 건지 모르겠다. 내가 어떤 식으로 더 엇나가야지 나를 봐줄 거냐고. 좋아하지도 않는 사람이랑 억지로 만나는 것도 이제 한계인 거 같은데. 김원필 너는 뭐가 그렇게 부족해서 너 좋아해주지도 않는 남자를 여태 좋아하고 있는 거야. 강영현은 어차피 너 안 좋아해. 너랑 안 만나고 싶어한다고. 무슨 부귀영화를 누리겠다고..........',
  },
  {
    id: 'n2',
    title: '가사 메모',
    date: '어제',
    body: '가사 메모\n\n괜찮다고 말하면\n정말 괜찮아질까\n\n아무렇지 않은 척\n오늘도 웃어 보였어\n\n→ 후렴 멜로디 다시 잡기',
  },
  {
    id: 'n3',
    title: '연락 정리',
    date: '어제',
    body: '연락 정리\n\n답장 안 하면 전화 옴\n전화 안 받으면 또 카톡 옴\n\n그냥 솔직하게 말하는 게 나을까\n아니면 차단...?\n\n일단 오늘은 무음.',
  },
  {
    id: 'n4',
    title: '학원 끝나는 시간',
    date: '2025. 10. 14.',
    body: '학원 끝나는 시간\n\n월 · 수 · 금 19:00\n화 · 목 18:30\n\n끝나고 바로 집 가기',
  },
  {
    id: 'n5',
    title: '보고 싶은 영화',
    date: '2025. 10. 02.',
    body: '보고 싶은 영화\n\n1. 비긴 어게인 (다시)\n2. 원스\n3. 어바웃 타임 (영현이형이랑 보고싶음)\n\n혼자 보러 가도 괜찮아',
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
        <h1 className="pt-10 text-[32px] font-bold tracking-tight">메모</h1>
        <div className="mt-2 flex items-center gap-2 rounded-[10px] bg-black/[0.06] px-2.5 py-2 text-[16px] text-black/40" aria-hidden>
          <Search className="size-4" />
          검색
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
        <span className="text-[12px] text-black/60">{`${NOTES.length}개의 메모`}</span>
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
          메모
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
