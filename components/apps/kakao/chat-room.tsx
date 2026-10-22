'use client'

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUp, ChevronLeft, Hash, Menu, Plus, Search, Smile, MapPin } from 'lucide-react'
import { Avatar, HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { contacts } from '@/lib/story/contacts'
import type { KakaoMessage, KakaoRoomId } from '@/lib/story/kakao'
import { useStory } from '@/lib/story/store'
import { dayKey, formatFullDate, formatTime } from '@/lib/story/time'
import { Sticker } from './sticker'
import { useIsAppActive } from '@/lib/story/app-presence'
import { IosKeyboard, KEYBOARD_HEIGHT, keyForChar, type PressedKey } from '@/components/phone/ios-keyboard'
import { SPRING } from '@/lib/motion/ios-physics'
import { playKeyClick } from '@/lib/sound'

/** Jeda sebelum karakter berikutnya diketik otomatis: acak seperti jari manusia, lebih lama setelah spasi & tanda baca. */
function typingDelay(prev: string | undefined, isFirst: boolean) {
  let ms = 55 + Math.random() * 65
  if (isFirst) ms += 260
  if (prev === ' ') ms += 45
  if (prev && /[.,?!~]/.test(prev)) ms += 170
  return ms
}

function keyFeedback(ch: string) {
  playKeyClick(ch === ' ' ? 'special' : 'letter')
  navigator.vibrate?.(4)
}

const ROOM_BG = '#bacee0'

export function ChatRoom({ roomId }: { roomId: KakaoRoomId }) {
  const {
    rooms,
    closeKakaoRoom,
    markRoomRead,
    onYhRoomShown,
    onRoomMessagesSeen,
    canSendIn,
    sendKakaoMessage,
    isUnreadByThem,
    totalUnread,
    unreadByRoom,
    replyOptions,
    sendKakaoChoice,
    isTypingIn,
  } = useStory()
  const [draft, setDraft] = useState('')
  const room = rooms.find((r) => r.id === roomId)!
  const canSend = canSendIn(roomId)
  const options = replyOptions(roomId)
  const theyAreTyping = isTypingIn(roomId)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [pressed, setPressed] = useState<PressedKey>(null)
  /** Pilihan QuickType yang sedang/selesai diketik otomatis */
  const [auto, setAuto] = useState<{ index: number; text: string; pos: number } | null>(null)
  const autoTyping = !!auto && auto.pos < auto.text.length
  const inputRef = useRef<HTMLInputElement>(null)
  // Keyboard hanya muncul bila ada giliran membalas (atau sudah terbuka sambil menunggu balasan).
  const replyable = canSend || keyboardOpen

  const submit = () => {
    if (!draft.trim() || !canSend || autoTyping) return
    // Teks pilihan QuickType yang tidak diubah dikirim sebagai pilihan itu; selain itu ketikan bebas.
    if (auto && draft === auto.text) sendKakaoChoice(roomId, auto.index)
    else sendKakaoMessage(roomId, draft)
    setDraft('')
    setAuto(null)
  }

  const flash = (key: PressedKey) => {
    setPressed(key)
    window.setTimeout(() => setPressed((cur) => (cur === key ? null : cur)), 95)
  }
  const contact = contacts[room.contactId]
  const scrollRef = useRef<HTMLDivElement>(null)
  const count = room.messages.length
  const otherUnread = totalUnread - (unreadByRoom[roomId] ?? 0)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [count])

  // Kartu pratinjau di App Switcher tidak dihitung sebagai membuka ruang chat.
  const active = useIsAppActive()

  // Mengetik otomatis satu karakter per langkah; berhenti saat app hanya pratinjau dan lanjut lagi saat aktif.
  useEffect(() => {
    if (!auto || !active || auto.pos >= auto.text.length) return
    const ch = auto.text[auto.pos]
    const timer = window.setTimeout(() => {
      flash(keyForChar(ch))
      keyFeedback(ch)
      setDraft(auto.text.slice(0, auto.pos + 1))
      setAuto({ ...auto, pos: auto.pos + 1 })
    }, typingDelay(auto.text[auto.pos - 1], auto.pos === 0))
    return () => window.clearTimeout(timer)
  }, [auto, active])

  useEffect(() => {
    if (!active) setKeyboardOpen(false)
  }, [active])

  const keepBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }
  useLayoutEffect(keepBottom, [theyAreTyping])

  const openKeyboard = () => {
    if (!replyable) return
    setKeyboardOpen(true)
    inputRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!active) return
    markRoomRead(roomId)
    onRoomMessagesSeen(
      roomId,
      room.messages.filter((m) => m.from === 'them').map((m) => m.id),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when messages arrive
  }, [active, roomId, count, markRoomRead, onRoomMessagesSeen])

  useEffect(() => {
    if (active && roomId === 'yh') onYhRoomShown()
  }, [active, roomId, onYhRoomShown])

  return (
    <div className="animate-push-in flex h-full flex-col text-black" style={{ backgroundColor: ROOM_BG }}>
      <StatusBar />
      <header className="relative flex h-12 shrink-0 items-center px-1.5">
        <button type="button" onClick={closeKakaoRoom} aria-label="Kembali ke daftar chat" className="flex items-center p-1.5">
          <ChevronLeft className="size-7" strokeWidth={1.8} />
          {otherUnread > 0 && <span className="text-[15px] font-medium">{otherUnread}</span>}
        </button>
        <h2 className="absolute left-1/2 max-w-[55%] -translate-x-1/2 truncate text-[17px] font-semibold">{contact.name}</h2>
        <span className="ml-auto flex items-center gap-4 pr-3" aria-hidden>
          <Search className="size-[22px]" strokeWidth={1.8} />
          <Menu className="size-[22px]" strokeWidth={1.8} />
        </span>
      </header>
      <div
        ref={scrollRef}
        onPointerDown={() => {
          if (keyboardOpen) {
            setKeyboardOpen(false)
            inputRef.current?.blur()
          }
        }}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 pb-3"
      >
        <MessageList
          messages={room.messages}
          contactName={contact.name}
          initial={contact.initial}
          color={contact.color}
          photo={contact.photo}
          isUnreadByThem={isUnreadByThem}
        />
        {theyAreTyping && (
          <TypingIndicator
            initial={contact.initial}
            color={contact.color}
            photo={contact.photo}
            grouped={room.messages[room.messages.length - 1]?.from === 'them'}
          />
        )}
      </div>
      <form
        className="flex shrink-0 items-center gap-2 bg-white px-2.5 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f2f2]" aria-hidden>
          <Plus className="size-5 text-[#6b6b6b]" strokeWidth={1.8} />
        </span>
        <span
          className="flex min-h-9 min-w-0 flex-1 items-center gap-1 rounded-[18px] bg-[#f2f2f2] py-1.5 pl-3.5 pr-3"
          onPointerDown={openKeyboard}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => {
              if (autoTyping) return
              setAuto(null)
              setDraft(e.target.value)
            }}
            onFocus={() => replyable && setKeyboardOpen(true)}
            onKeyDown={(e) => {
              // Keyboard fisik ikut menyalakan tombol di keyboard layar.
              if (e.key.length === 1) {
                flash(keyForChar(e.key))
                keyFeedback(e.key)
              } else if (e.key === 'Backspace') flash({ key: 'back' })
              if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              submit()
            }}
            readOnly={autoTyping}
            disabled={!replyable}
            // Keyboard bawaan HP tidak muncul; yang dipakai keyboard iOS di layar.
            inputMode="none"
            aria-label="Ketik pesan"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-[15px] caret-[#3478f6] outline-none placeholder:text-black/30 disabled:cursor-not-allowed"
          />
          <Smile className="size-[22px] shrink-0 text-[#6b6b6b]" strokeWidth={1.6} aria-hidden />
        </span>
        {draft.trim() && canSend ? (
          <button
            type="submit"
            aria-label="Kirim"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fee500] active:opacity-70"
          >
            <ArrowUp className="size-5 text-black" strokeWidth={2.2} />
          </button>
        ) : (
          <Hash className="size-6 shrink-0 text-[#6b6b6b]" strokeWidth={1.7} aria-hidden />
        )}
      </form>
      <motion.div
        className="shrink-0 overflow-hidden"
        initial={false}
        animate={{ height: keyboardOpen ? KEYBOARD_HEIGHT : 0 }}
        transition={SPRING.appOpen}
        onUpdate={keepBottom}
      >
        <IosKeyboard
          suggestions={draft ? [] : options}
          onSuggestion={(index) => {
            const text = options[index]
            if (!text) return
            setDraft('')
            setAuto({ index, text, pos: 0 })
          }}
          onKey={(ch) => {
            if (autoTyping) return
            keyFeedback(ch)
            setAuto(null)
            setDraft((d) => d + ch)
          }}
          onBackspace={() => {
            if (autoTyping) return
            playKeyClick('special')
            setAuto(null)
            setDraft((d) => d.slice(0, -1))
          }}
          onReturn={submit}
          pressed={pressed}
          locked={autoTyping}
          canReturn={!!draft.trim() && canSend}
        />
      </motion.div>
      <HomeIndicator className={keyboardOpen ? 'bg-[#d1d4da]' : 'bg-white'} />
    </div>
  )
}

/** Gelembung "sedang mengetik" lawan bicara. */
function TypingIndicator({ initial, color, photo, grouped }: { initial: string; color: string; photo?: string; grouped: boolean }) {
  return (
    <div className={`flex gap-2 ${grouped ? 'mt-[5px]' : 'mt-2.5'}`} role="status" aria-label="Sedang mengetik">
      {/* Seperti gelembung KakaoTalk: avatar tidak diulang bila pesan sebelumnya juga dari lawan bicara. */}
      <span className="w-10 shrink-0">{!grouped && <Avatar initial={initial} color={color} size={40} shape="squircle" src={photo} />}</span>
      <div className="ml-1.5 flex items-center gap-[5px] rounded-[15px] bg-white px-3.5 py-[11px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="animate-typing-dot size-[7px] rounded-full bg-[#9aa3ad]" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
    </div>
  )
}

/** Di-memo agar ketikan per huruf tidak me-render ulang seluruh riwayat chat. */
const MessageList = memo(function MessageList({
  messages,
  contactName,
  initial,
  color,
  photo,
  isUnreadByThem,
}: {
  messages: KakaoMessage[]
  contactName: string
  initial: string
  color: string
  photo?: string
  isUnreadByThem: (m: KakaoMessage) => boolean
}) {
  return (
    <ol className="flex flex-col">
      {messages.map((m, i) => {
        const prev = messages[i - 1]
        const next = messages[i + 1]
        const newDay = !prev || dayKey(prev.at) !== dayKey(m.at)
        const startsGroup = newDay || prev.from !== m.from || formatTime(prev.at) !== formatTime(m.at)
        const endsGroup = !next || next.from !== m.from || formatTime(next.at) !== formatTime(m.at) || dayKey(next.at) !== dayKey(m.at)
        const time = endsGroup ? <time className="shrink-0 pb-[1px] text-[10.5px] text-[#556677]">{formatTime(m.at)}</time> : null
        return (
          <li key={m.id} className="flex flex-col">
            {newDay && (
              <p className="mx-auto my-4 rounded-full bg-[#9fb3c6]/80 px-3.5 py-[5px] text-[11.5px] text-white">{formatFullDate(m.at)}</p>
            )}
            {m.from === 'me' ? (
              <div className={`flex items-end justify-end gap-[5px] pr-1.5 ${startsGroup ? 'mt-2.5' : 'mt-[5px]'}`}>
                <span className="flex shrink-0 flex-col items-end">
                  {isUnreadByThem(m) && (
                    <span className="text-[11px] font-semibold leading-none text-[#e6b800]">
                      1<span className="sr-only"> belum dibaca</span>
                    </span>
                  )}
                  {time}
                </span>
                <Bubble message={m} mine tail={startsGroup} />
              </div>
            ) : (
              <div className={`flex gap-2 ${startsGroup ? 'mt-2.5' : 'mt-[5px]'}`}>
                <span className="w-10 shrink-0">
                  {startsGroup && <Avatar initial={initial} color={color} size={40} shape="squircle" src={photo} />}
                </span>
                <div className="min-w-0 flex-1 pl-1.5">
                  {startsGroup && <p className="mb-[5px] text-[12.5px] text-[#4a5561]">{contactName}</p>}
                  <div className="flex items-end gap-[5px]">
                    <Bubble message={m} tail={startsGroup} />
                    {time}
                  </div>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
})

function Bubble({ message, mine = false, tail }: { message: KakaoMessage; mine?: boolean; tail: boolean }) {
  const c = message.content
  if (c.type === 'sticker') return <Sticker kind={c.sticker} />
  if (c.type === 'location') {
    return (
      <div className="w-52 overflow-hidden rounded-[14px] bg-white">
        <div className="flex h-24 items-center justify-center bg-[#e8eef3]">
          <MapPin fill="#ff5a4f" className="size-8 fill-[#ff5a4f] text-white" aria-hidden />
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[14px] font-semibold">{c.title}</p>
          <p className="text-[12px] text-black/45">Berbagi lokasi</p>
        </div>
      </div>
    )
  }
  if (c.type === 'card') {
    const { title, body, button, footer } = c.card
    return (
      <div className="w-[236px] overflow-hidden rounded-[14px] bg-white">
        <p className="bg-[#f7f7f7] px-3.5 py-2.5 text-[14px] font-semibold leading-snug">{title}</p>
        <p className="whitespace-pre-wrap break-words px-3.5 pb-3 pt-2.5 text-[13.5px] leading-[1.5]">{body}</p>
        <div className="px-3 pb-3">
          <span className="block rounded-md bg-[#f2f2f2] py-2 text-center text-[13.5px] font-medium">{button}</span>
          {footer && <p className="mt-2 text-[11px] leading-snug text-black/40">{footer}</p>}
        </div>
      </div>
    )
  }
  const bg = mine ? '#fee500' : '#ffffff'
  return (
    <div
      className="relative max-w-[232px] whitespace-pre-wrap break-words rounded-[15px] px-[11px] py-[7px] text-[14.5px] leading-[1.4]"
      style={{ backgroundColor: bg }}
    >
      {tail && (
        <span
          aria-hidden
          className={`absolute top-[6px] size-0 border-y-[5px] border-y-transparent ${mine ? '-right-[6px] border-l-[8px]' : '-left-[6px] border-r-[8px]'}`}
          style={mine ? { borderLeftColor: bg } : { borderRightColor: bg }}
        />
      )}
      {c.reply && (
        <span className="mb-1.5 block border-b border-black/10 pb-1.5">
          <span className="block text-[12.5px] font-semibold text-black/80">{`Membalas ${c.reply.to}`}</span>
          <span className="block truncate text-[12.5px] text-black/50">{c.reply.text}</span>
        </span>
      )}
      {c.text}
    </div>
  )
}
