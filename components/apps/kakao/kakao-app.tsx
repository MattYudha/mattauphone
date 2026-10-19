'use client'

import { useState } from 'react'
import { MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell, Avatar } from '@/components/phone/chrome'
import { contacts, OWNER } from '@/lib/story/contacts'
import { kakaoFriendOrder, type KakaoMessage } from '@/lib/story/kakao'
import { useStory } from '@/lib/story/store'
import { formatListDate } from '@/lib/story/time'
import { ChatRoom } from './chat-room'

export function previewText(m: KakaoMessage) {
  if (m.content.type === 'text') return m.content.text.replace(/\n+/g, ' ')
  if (m.content.type === 'sticker') return '이모티콘을 보냈습니다.'
  return '위치를 공유했습니다.'
}

export function KakaoApp() {
  const { kakaoRoomId } = useStory()
  const [tab, setTab] = useState<'friends' | 'chats'>('chats')

  if (kakaoRoomId) return <ChatRoom key={kakaoRoomId} roomId={kakaoRoomId} />

  return (
    <AppShell
      header={
        <header className="flex h-12 shrink-0 items-center px-5">
          <h2 className="text-[22px] font-bold">{tab === 'chats' ? '채팅' : '친구'}</h2>
        </header>
      }
      footer={<KakaoTabs tab={tab} onChange={setTab} />}
    >
      {tab === 'chats' ? <ChatList /> : <FriendList />}
    </AppShell>
  )
}

function KakaoTabs({ tab, onChange }: { tab: 'friends' | 'chats'; onChange: (t: 'friends' | 'chats') => void }) {
  const { totalUnread } = useStory()
  const items = [
    { id: 'friends' as const, label: '친구', Icon: User },
    { id: 'chats' as const, label: '채팅', Icon: MessageCircle },
  ]
  return (
    <nav aria-label="카카오톡 탭" className="grid shrink-0 grid-cols-2 border-t border-black/5 bg-white">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-current={tab === id ? 'page' : undefined}
          className={cn('relative flex flex-col items-center gap-0.5 py-2 text-[10px]', tab === id ? 'text-black' : 'text-black/35')}
        >
          <span className="relative">
            <Icon className={cn('size-6', tab === id && 'fill-black')} aria-hidden />
            {id === 'chats' && totalUnread > 0 && (
              <span className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4b2b] px-1 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </span>
          {label}
        </button>
      ))}
    </nav>
  )
}

function ChatList() {
  const { rooms, unreadByRoom, openKakaoRoom } = useStory()
  return (
    <ul className="pb-2">
      {rooms.map((room) => {
        const c = contacts[room.contactId]
        const last = room.messages[room.messages.length - 1]
        const unread = unreadByRoom[room.id] ?? 0
        return (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => openKakaoRoom(room.id)}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left active:bg-black/5"
            >
              <Avatar initial={c.initial} color={c.color} size={48} shape="squircle" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{c.name}</span>
                <span className="mt-0.5 line-clamp-1 text-[13px] text-black/50">{previewText(last)}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1 self-start pt-0.5">
                <span className="text-[11px] text-black/40">{formatListDate(last.at)}</span>
                {unread > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4b2b] px-1.5 text-[11px] font-bold text-white">
                    <span className="sr-only">읽지 않은 메시지 </span>
                    {unread}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function FriendList() {
  const { openKakaoRoom } = useStory()
  return (
    <div className="pb-2">
      <div className="flex items-center gap-3 px-5 py-3">
        <Avatar initial="원" color="#9aa3ad" size={56} shape="squircle" />
        <div>
          <p className="text-base font-semibold">{OWNER.name}</p>
          <p className="text-[13px] text-black/45">{OWNER.status}</p>
        </div>
      </div>
      <div className="mx-5 border-t border-black/5" />
      <p className="px-5 pb-1 pt-3 text-xs text-black/45">친구 {kakaoFriendOrder.length}</p>
      <ul>
        {kakaoFriendOrder.map((id) => {
          const c = contacts[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => openKakaoRoom(id)}
                className="flex w-full items-center gap-3 px-5 py-2 text-left active:bg-black/5"
              >
                <Avatar initial={c.initial} color={c.color} size={44} shape="squircle" />
                <span className="text-[15px]">{c.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
