'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { ChevronLeft, MapPin } from 'lucide-react'
import { Avatar, HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { contacts } from '@/lib/story/contacts'
import type { KakaoMessage, KakaoRoomId } from '@/lib/story/kakao'
import { useStory } from '@/lib/story/store'
import { dayKey, formatFullDate, formatTime } from '@/lib/story/time'
import { Sticker } from './sticker'

export function ChatRoom({ roomId }: { roomId: KakaoRoomId }) {
  const { rooms, closeKakaoRoom, markRoomRead, onYhRoomShown } = useStory()
  const room = rooms.find((r) => r.id === roomId)!
  const contact = contacts[room.contactId]
  const scrollRef = useRef<HTMLDivElement>(null)
  const count = room.messages.length

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [count])

  useEffect(() => {
    markRoomRead(roomId)
  }, [roomId, count, markRoomRead])

  useEffect(() => {
    if (roomId === 'yh') onYhRoomShown()
  }, [roomId, onYhRoomShown])

  return (
    <div className="animate-push-in flex h-full flex-col bg-[#b2c7d9] text-black">
      <StatusBar />
      <header className="flex h-11 shrink-0 items-center gap-1 px-2">
        <button type="button" onClick={closeKakaoRoom} aria-label="채팅 목록으로" className="p-1.5">
          <ChevronLeft className="size-7" />
        </button>
        <h2 className="truncate text-[17px] font-semibold">{contact.name}</h2>
      </header>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-3">
        <MessageList messages={room.messages} contactName={contact.name} initial={contact.initial} color={contact.color} />
      </div>
      <div className="shrink-0 bg-white px-3 py-2">
        <p className="rounded-full bg-[#f2f2f2] px-4 py-2 text-[13px] text-black/35">메시지를 보낼 수 없는 기록 보기 화면입니다</p>
      </div>
      <HomeIndicator className="bg-white" />
    </div>
  )
}

function MessageList({
  messages,
  contactName,
  initial,
  color,
}: {
  messages: KakaoMessage[]
  contactName: string
  initial: string
  color: string
}) {
  return (
    <ol className="flex flex-col">
      {messages.map((m, i) => {
        const prev = messages[i - 1]
        const newDay = !prev || dayKey(prev.at) !== dayKey(m.at)
        const startsGroup = newDay || prev.from !== m.from || formatTime(prev.at) !== formatTime(m.at)
        return (
          <li key={m.id} className="flex flex-col">
            {newDay && (
              <p className="mx-auto my-4 rounded-full bg-black/15 px-3 py-1 text-[11px] text-white">{formatFullDate(m.at)}</p>
            )}
            {m.from === 'me' ? (
              <div className={`flex items-end justify-end gap-1 ${startsGroup ? 'mt-2' : 'mt-1'}`}>
                <time className="shrink-0 text-[10px] text-black/45">{formatTime(m.at)}</time>
                <Bubble message={m} mine />
              </div>
            ) : (
              <div className={`flex gap-2 ${startsGroup ? 'mt-2' : 'mt-1'}`}>
                <span className="w-10 shrink-0">{startsGroup && <Avatar initial={initial} color={color} size={40} shape="squircle" />}</span>
                <div className="min-w-0 flex-1">
                  {startsGroup && <p className="mb-1 text-xs text-black/70">{contactName}</p>}
                  <div className="flex items-end gap-1">
                    <Bubble message={m} />
                    <time className="shrink-0 text-[10px] text-black/45">{formatTime(m.at)}</time>
                  </div>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Bubble({ message, mine = false }: { message: KakaoMessage; mine?: boolean }) {
  const c = message.content
  if (c.type === 'sticker') return <Sticker kind={c.sticker} />
  if (c.type === 'location') {
    return (
      <div className="w-52 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex h-20 items-center justify-center bg-[#e8eef3]">
          <MapPin className="size-8 fill-[#ff5a4f] text-white" aria-hidden />
        </div>
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">{c.title}</p>
          <p className="text-xs text-black/45">위치 공유</p>
        </div>
      </div>
    )
  }
  return (
    <p
      className={`max-w-[230px] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-[14px] leading-snug ${
        mine ? 'rounded-tr-sm bg-[#fee500]' : 'rounded-tl-sm bg-white'
      }`}
    >
      {c.text}
    </p>
  )
}
