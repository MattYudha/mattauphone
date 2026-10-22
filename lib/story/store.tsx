'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { contacts } from './contacts'
import { playSound, unlockSounds } from '@/lib/sound'
import {
  AFTER_CALL_BANNER_MESSAGES,
  AFTER_CALL_ISO,
  AFTER_CALL_ROOM_MESSAGES,
  EVENT_JY_MESSAGES,
  EVENT_YH_MESSAGES,
} from './events'
import {
  autoReplyId,
  autoReplyLines,
  isAutoReplyRoom,
  matchBranch,
  type AutoReplyRoom,
  type AutoReplyState,
} from './auto-reply'
import { kakaoRooms, type KakaoMessage, type KakaoRoom, type KakaoRoomId } from './kakao'
import { FIRST_TURN, FOLLOW_UPS, followUpReplyId } from './reply-scripts'
import { smsThreads, type SmsMessage, type SmsThread } from './sms'
import { NOW_ISO, toTime } from './time'

/** Pesan Younghyun yang menuntut jawaban dari pengguna. Baru bisa dibalas setelah pesan ini terlihat di dalam ruang chat. */
const YH_GATE_MESSAGE_ID = AFTER_CALL_ROOM_MESSAGES[AFTER_CALL_ROOM_MESSAGES.length - 1].id
const AUTO_READ_DELAY_MS = 700
const AUTO_REPLY_FIRST_MS = 1700
const AUTO_REPLY_GAP_MS = 1000
const FIRST_SENT_SEQ = 100

function senderName(roomId: KakaoRoomId) {
  const room = kakaoRooms.find((r) => r.id === roomId)
  return room ? contacts[room.contactId].name : ''
}

export type SmsNotification = { thread: SmsThread; unread: SmsMessage[] }

export type AppId =
  | 'kakao'
  | 'messages'
  | 'phone'
  | 'photos'
  | 'settings'
  | 'safari'
  | 'anyai'
  | 'notes'
  | 'camera'
  | 'voicememos'
  | 'calendar'
  | 'clock'
  | 'instagram'
  | 'catchtable'
export type Screen =
  | { kind: 'lock' }
  | { kind: 'passcode' }
  | { kind: 'home' }
  | { kind: 'app'; app: AppId }
  | { kind: 'switcher' }

const APP_ID_LIST: AppId[] = [
  'kakao', 'messages', 'phone', 'photos', 'settings', 'safari', 'anyai',
  'notes', 'camera', 'voicememos', 'calendar', 'clock', 'instagram', 'catchtable',
]

type StoryProgress = {
  yhArrived: boolean
  jyArrived: boolean
  /** Apakah pengguna menerima telepon Younghyun lalu menutupnya sendiri. Setelah itu jam berubah jadi 18.58. */
  yhCallEnded: boolean
  addedMessages: KakaoMessage[]
  readMessageIds: string[]
  /** Ruang yang sejak awal berstatus belum dibaca dan sudah dibuka pengguna */
  readRooms: KakaoRoomId[]
  cameraUsed: boolean
  /** id SMS yang sudah ditandai dibaca karena pengguna membuka utasnya */
  readSmsIds: string[]
  /** id pesan kiriman pengguna yang sudah dibaca lawan bicara */
  readByThemIds: string[]
  /** Cabang balasan otomatis yang dikunci per ruang. Sekali ditentukan, tidak berubah. */
  autoReplies: Partial<Record<AutoReplyRoom, AutoReplyState>>
  /** Apakah "Kamu nggak ketemu Woo Junyoung, kan?" benar-benar sudah terlihat di ruang chat Younghyun */
  yhQuestionSeen: boolean
  /** Nomor urut pesan berikutnya yang dikirim (atau diterima) */
  nextSeq: number
  /** Giliran percakapan lanjutan per ruang setelah cabang terkunci: pilihan QuickType (indeks) atau ketikan bebas */
  followUps: Partial<Record<AutoReplyRoom, FollowUp[]>>
}

type FollowUp = { choice: number | 'free'; sentId: string }
type Reply = { id: string; text: string }

/** Lama lawan bicara "sedang mengetik" sebelum pesan muncul, sebanding dengan panjang pesan. */
const typingDuration = (text: string) => Math.min(2600, Math.max(900, 500 + text.length * 55))
const TYPING_START_MS = 1000
const TYPING_GAP_MS = 450

/** Semua balasan yang seharusnya sudah/akan dikirim lawan bicara di ruang ini, berurutan. */
function expectedReplies(room: AutoReplyRoom, p: StoryProgress): Reply[] {
  const state = p.autoReplies[room]
  if (!state) return []
  const list: Reply[] = autoReplyLines(room, state.branch).map((text, i) => ({ text, id: autoReplyId(room, state.branch, i) }))
  const turns = FOLLOW_UPS[room][state.branch]
  ;(p.followUps[room] ?? []).forEach((f, turn) => {
    const script = turns[turn]
    if (!script) return
    const lines = f.choice === 'free' ? script.freeReplies : script.options[f.choice].replies
    lines.forEach((text, i) => list.push({ text, id: followUpReplyId(room, state.branch, turn, f.choice, i) }))
  })
  return list
}

const BANNER_GAP_MS = 1800
const ROOM_GAP_MS = 1500

export type Banner = {
  key: string
  roomId: KakaoRoomId
  sender: string
  lines: string[]
  time: string
}

const STORAGE_KEY = 'wonpil-phone-story-v2'
/** Daftar app terbaru (App Switcher) disimpan terpisah dari progres cerita, hanya untuk sesi ini. */
const RECENTS_KEY = 'wonpil-phone-recents-v1'

function loadRecents(): AppId[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(RECENTS_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((a): a is AppId => APP_ID_LIST.includes(a as AppId)).filter((a, i, all) => all.indexOf(a) === i)
  } catch {
    return []
  }
}
const INITIAL: StoryProgress = {
  yhArrived: false,
  jyArrived: false,
  yhCallEnded: false,
  addedMessages: [],
  readMessageIds: [],
  readRooms: [],
  cameraUsed: false,
  readSmsIds: [],
  readByThemIds: [],
  autoReplies: {},
  yhQuestionSeen: false,
  nextSeq: FIRST_SENT_SEQ,
  followUps: {},
}

function loadProgress(): StoryProgress {
  if (typeof window === 'undefined') return INITIAL
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw) as StoryProgress
    if (!Array.isArray(parsed.addedMessages) || !Array.isArray(parsed.readMessageIds)) return INITIAL
    const merged = { ...INITIAL, ...parsed }
    if (!Array.isArray(merged.readSmsIds)) merged.readSmsIds = []
    if (!Array.isArray(merged.readByThemIds)) merged.readByThemIds = []
    if (!merged.autoReplies || typeof merged.autoReplies !== 'object') merged.autoReplies = {}
    if (typeof merged.nextSeq !== 'number') merged.nextSeq = FIRST_SENT_SEQ
    if (!merged.followUps || typeof merged.followUps !== 'object') merged.followUps = {}
    return Array.isArray(merged.readRooms) ? merged : { ...merged, readRooms: [] }
  } catch {
    return INITIAL
  }
}

export function sortMessages(messages: KakaoMessage[]) {
  return [...messages].sort((a, b) => toTime(a.at) - toTime(b.at) || a.seq - b.seq)
}

type StoryContext = {
  screen: Screen
  unlock: () => void
  openPasscode: () => void
  lock: () => void
  goHome: () => void
  openApp: (app: AppId) => void
  /** App yang pernah dibuka, terbaru di depan */
  recentApps: AppId[]
  openSwitcher: () => void
  closeRecentApp: (app: AppId) => void
  kakaoRoomId: KakaoRoomId | null
  openKakaoRoom: (id: KakaoRoomId) => void
  closeKakaoRoom: () => void
  rooms: KakaoRoom[]
  unreadByRoom: Partial<Record<KakaoRoomId, number>>
  totalUnread: number
  markRoomRead: (id: KakaoRoomId) => void
  onYhRoomShown: () => void
  /** Melaporkan id pesan lawan bicara yang benar-benar tampil di layar ruang chat */
  onRoomMessagesSeen: (id: KakaoRoomId, messageIds: string[]) => void
  canSendIn: (id: KakaoRoomId) => boolean
  sendKakaoMessage: (id: KakaoRoomId, text: string) => void
  /** Dua kalimat untuk bar QuickType di ruang ini (kosong jika tidak ada giliran yang bisa dibalas) */
  replyOptions: (id: KakaoRoomId) => string[]
  /** Mengirim pilihan QuickType ke-index (teks sudah selesai diketik di kolom pesan) */
  sendKakaoChoice: (id: KakaoRoomId, index: number) => void
  /** Lawan bicara sedang mengetik di ruang ini */
  isTypingIn: (id: KakaoRoomId) => boolean
  /** Pesan kiriman pengguna yang belum dibaca lawan bicara */
  isUnreadByThem: (message: KakaoMessage) => boolean
  clock: string
  yhCallEnded: boolean
  endYhCall: () => void
  banner: Banner | null
  dismissBanner: () => void
  openBanner: (banner: Banner) => void
  resetStory: () => void
  cameraUsed: boolean
  markCameraUsed: () => void
  smsThreadId: string | null
  openSmsThread: (id: string) => void
  closeSmsThread: () => void
  /** Masuk dari notifikasi layar kunci: setelah kode sandi, pindah ke utas SMS tersebut */
  openSmsFromLock: (id: string) => void
  markSmsThreadRead: (id: string) => void
  smsUnreadByThread: Record<string, number>
  totalSmsUnread: number
  smsNotifications: SmsNotification[]
}

const Ctx = createContext<StoryContext | null>(null)

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'lock' })
  const [recentApps, setRecentApps] = useState<AppId[]>(loadRecents)
  const [kakaoRoomId, setKakaoRoomId] = useState<KakaoRoomId | null>(null)
  const [progress, setProgress] = useState<StoryProgress>(loadProgress)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [smsThreadId, setSmsThreadId] = useState<string | null>(null)
  const [typing, setTyping] = useState<Partial<Record<AutoReplyRoom, boolean>>>({})
  /** Ruang yang balasannya sedang dijadwalkan, supaya jadwal tidak dibuat dua kali */
  const delivering = useRef<Partial<Record<AutoReplyRoom, boolean>>>({})
  const pendingSmsThread = useRef<string | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const timers = useRef<number[]>([])
  const viewRef = useRef({ screen, kakaoRoomId })
  viewRef.current = { screen, kakaoRoomId }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Storage can be unavailable (e.g. privacy mode); progress then lives in memory only.
    }
  }, [progress])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(RECENTS_KEY, JSON.stringify(recentApps))
    } catch {
      // Sama seperti progres: tanpa storage, daftar app terbaru hanya hidup di memori.
    }
  }, [recentApps])

  /** Menampilkan app di layar penuh sekaligus memindahkannya ke urutan terdepan daftar app terbaru. */
  const showApp = useCallback((app: AppId) => {
    setRecentApps((list) => [app, ...list.filter((a) => a !== app)])
    setScreen({ kind: 'app', app })
  }, [])

  useEffect(() => {
    window.addEventListener('pointerdown', unlockSounds, { once: true })
    window.addEventListener('keydown', unlockSounds, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockSounds)
      window.removeEventListener('keydown', unlockSounds)
    }
  }, [])

  useEffect(() => {
    const list = timers.current
    return () => {
      list.forEach((t) => window.clearTimeout(t))
      // Jadwal balasan ikut batal, jadi ruang boleh dijadwalkan ulang (mis. StrictMode memasang ulang effect).
      delivering.current = {}
      setTyping({})
    }
  }, [])

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const triggerYh = useCallback(() => {
    if (progressRef.current.yhArrived) return
    const next = {
      ...progressRef.current,
      yhArrived: true,
      addedMessages: [...progressRef.current.addedMessages, ...EVENT_YH_MESSAGES],
    }
    progressRef.current = next
    setProgress(next)
    playSound('kakao')
    setBanner({ key: 'yh', roomId: 'yh', sender: contacts.yh.name, lines: ['Belum pulang kerja, kan?'], time: '18.57' })
  }, [])

  /** Mengirim pesan satu per satu. Pesan yang sudah tiba dilewati, jadi tidak dobel saat dilanjutkan setelah refresh. */
  const deliverSequentially = useCallback((messages: KakaoMessage[], gapMs: number, firstDelayMs: number) => {
    const pending = messages.filter((m) => !progressRef.current.addedMessages.some((x) => x.id === m.id))
    pending.forEach((message, i) => {
      timers.current.push(
        window.setTimeout(() => {
          const p = progressRef.current
          if (p.addedMessages.some((x) => x.id === message.id)) return
          const next = { ...p, addedMessages: [...p.addedMessages, message] }
          progressRef.current = next
          setProgress(next)
          playSound('kakao')
          const { screen: s, kakaoRoomId: openRoom } = viewRef.current
          const viewingRoom = s.kind === 'app' && s.app === 'kakao' && openRoom === message.roomId
          if (!viewingRoom && message.content.type === 'text') {
            setBanner({
              key: message.id,
              roomId: message.roomId,
              sender: senderName(message.roomId),
              lines: [message.content.text],
              time: progressRef.current.yhCallEnded ? '18.58' : '18.57',
            })
          }
        }, firstDelayMs + i * gapMs),
      )
    })
  }, [])

  const endYhCall = useCallback(() => {
    if (progressRef.current.yhCallEnded) return
    const next = { ...progressRef.current, yhCallEnded: true }
    progressRef.current = next
    setProgress(next)
    deliverSequentially(AFTER_CALL_BANNER_MESSAGES, BANNER_GAP_MS, 1000)
  }, [deliverSequentially])

  useEffect(() => {
    const p = progressRef.current
    if (!p.yhCallEnded) return
    deliverSequentially(AFTER_CALL_BANNER_MESSAGES, BANNER_GAP_MS, 1500)
    if (AFTER_CALL_ROOM_MESSAGES.some((m) => p.addedMessages.some((x) => x.id === m.id))) {
      deliverSequentially(AFTER_CALL_ROOM_MESSAGES, ROOM_GAP_MS, 1500)
    }
  }, [deliverSequentially])

  const triggerJy = useCallback(() => {
    const p = progressRef.current
    if (!p.yhArrived || p.jyArrived) return
    const next = { ...p, jyArrived: true, addedMessages: [...p.addedMessages, ...EVENT_JY_MESSAGES] }
    progressRef.current = next
    setProgress(next)
    playSound('kakao')
    setBanner({
      key: 'jy',
      roomId: 'jy',
      sender: contacts.jy.name,
      lines: ['Wonpil-ssi', 'Aku udah sampai di parkiran akademi~'],
      time: '18.57',
    })
  }, [])

  const unlock = useCallback(() => {
    const target = pendingSmsThread.current
    pendingSmsThread.current = null
    if (target) {
      setSmsThreadId(target)
      showApp('messages')
    } else {
      setScreen({ kind: 'home' })
    }
    if (!progressRef.current.yhArrived) schedule(triggerYh, 900)
  }, [triggerYh, showApp])

  const onYhRoomShown = useCallback(() => {
    const p = progressRef.current
    if (p.yhArrived && !p.jyArrived) schedule(triggerJy, 1200)
    const bannerBatchDone = AFTER_CALL_BANNER_MESSAGES.every((m) => p.addedMessages.some((x) => x.id === m.id))
    const roomBatchStarted = AFTER_CALL_ROOM_MESSAGES.some((m) => p.addedMessages.some((x) => x.id === m.id))
    if (p.yhCallEnded && bannerBatchDone && !roomBatchStarted) {
      deliverSequentially(AFTER_CALL_ROOM_MESSAGES, ROOM_GAP_MS, 1500)
    }
  }, [triggerJy, deliverSequentially])

  const markRoomRead = useCallback((id: KakaoRoomId) => {
    const p = progressRef.current
    const unreadIds = p.addedMessages
      .filter((m) => m.roomId === id && m.from === 'them' && !p.readMessageIds.includes(m.id))
      .map((m) => m.id)
    const staticUnread = Boolean(kakaoRooms.find((r) => r.id === id)?.initialUnread) && !p.readRooms.includes(id)
    if (unreadIds.length === 0 && !staticUnread) return
    const next = {
      ...p,
      readMessageIds: [...p.readMessageIds, ...unreadIds],
      readRooms: staticUnread ? [...p.readRooms, id] : p.readRooms,
    }
    progressRef.current = next
    setProgress(next)
  }, [])

  const commit = (next: StoryProgress) => {
    progressRef.current = next
    setProgress(next)
  }

  const onRoomMessagesSeen = useCallback((id: KakaoRoomId, messageIds: string[]) => {
    const p = progressRef.current
    if (id === 'yh' && !p.yhQuestionSeen && messageIds.includes(YH_GATE_MESSAGE_ID)) {
      commit({ ...p, yhQuestionSeen: true })
    }
  }, [])

  const markReadByThem = useCallback((messageId: string) => {
    const p = progressRef.current
    if (p.readByThemIds.includes(messageId)) return
    commit({ ...p, readByThemIds: [...p.readByThemIds, messageId] })
  }, [])

  /**
   * Mengirim berurutan balasan yang belum tiba, masing-masing didahului indikator "sedang mengetik".
   * Balasan yang sudah tiba dilewati, jadi tetap berlanjut tanpa dobel setelah refresh atau masuk ulang.
   */
  const deliverReplies = useCallback((room: AutoReplyRoom, firstDelayMs: number) => {
    if (delivering.current[room]) return
    const pending = expectedReplies(room, progressRef.current).filter(
      (r) => !progressRef.current.addedMessages.some((m) => m.id === r.id),
    )
    if (pending.length === 0) return
    delivering.current[room] = true
    let t = firstDelayMs
    pending.forEach((reply, i) => {
      const startAt = t
      const deliverAt = startAt + typingDuration(reply.text)
      t = deliverAt + TYPING_GAP_MS
      schedule(() => setTyping((x) => ({ ...x, [room]: true })), startAt)
      schedule(() => {
        const p = progressRef.current
        setTyping((x) => ({ ...x, [room]: false }))
        if (i === pending.length - 1) delivering.current[room] = false
        if (p.addedMessages.some((m) => m.id === reply.id)) return
        const message: KakaoMessage = {
          id: reply.id,
          roomId: room,
          from: 'them',
          at: p.yhCallEnded ? AFTER_CALL_ISO : NOW_ISO,
          seq: p.nextSeq,
          content: { type: 'text', text: reply.text },
        }
        commit({ ...p, nextSeq: p.nextSeq + 1, addedMessages: [...p.addedMessages, message] })
        playSound('kakao')
        const { screen: s, kakaoRoomId: openRoom } = viewRef.current
        const viewingRoom = s.kind === 'app' && s.app === 'kakao' && openRoom === room
        if (!viewingRoom) {
          setBanner({
            key: message.id,
            roomId: room,
            sender: senderName(room),
            lines: [reply.text],
            time: p.yhCallEnded ? '18.58' : '18.57',
          })
        }
      }, deliverAt)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const p = progressRef.current
    for (const room of ['yh', 'jy'] as const) {
      const state = p.autoReplies[room]
      if (!state) continue
      markReadByThem(state.triggerId)
      for (const f of p.followUps[room] ?? []) markReadByThem(f.sentId)
      deliverReplies(room, TYPING_START_MS)
    }
  }, [markReadByThem, deliverReplies])

  /** Syarat cerita untuk membalas di ruang ini, belum memperhitungkan giliran. */
  const roomOpen = (id: KakaoRoomId, p: StoryProgress) => {
    if (id === 'yh') return p.yhQuestionSeen
    if (id === 'jy') return p.jyArrived
    return false
  }

  /** Bisa membalas bila syarat cerita terpenuhi, semua balasan lawan bicara sudah tiba, dan masih ada giliran. */
  const canSend = (id: KakaoRoomId, p: StoryProgress) => {
    if (!roomOpen(id, p) || !isAutoReplyRoom(id)) return false
    const state = p.autoReplies[id]
    if (!state) return true
    if (expectedReplies(id, p).some((r) => !p.addedMessages.some((m) => m.id === r.id))) return false
    return (p.followUps[id]?.length ?? 0) < FOLLOW_UPS[id][state.branch].length
  }

  const replyOptions = (id: KakaoRoomId, p: StoryProgress): string[] => {
    if (!isAutoReplyRoom(id) || !canSend(id, p)) return []
    const state = p.autoReplies[id]
    if (!state) return [FIRST_TURN[id].A, FIRST_TURN[id].B]
    const turn = FOLLOW_UPS[id][state.branch][p.followUps[id]?.length ?? 0]
    return turn ? turn.options.map((o) => o.text) : []
  }

  /** Menyimpan pesan pengguna lalu menjadwalkan "dibaca" dan balasan lawan bicara. */
  const sendAndReply = (
    id: AutoReplyRoom,
    text: string,
    apply: (next: StoryProgress, sentId: string) => StoryProgress | null,
  ) => {
    const p = progressRef.current
    const message: KakaoMessage = {
      id: `sent-${p.nextSeq}`,
      roomId: id,
      from: 'me',
      at: p.yhCallEnded ? AFTER_CALL_ISO : NOW_ISO,
      seq: p.nextSeq,
      content: { type: 'text', text },
    }
    const base: StoryProgress = { ...p, nextSeq: p.nextSeq + 1, addedMessages: [...p.addedMessages, message] }
    const next = apply(base, message.id)
    commit(next ?? base)
    // Hanya pesan yang memenuhi syarat yang dibaca. Pesan tak terklasifikasi tetap belum dibaca dan tidak dibalas.
    if (!next) return
    schedule(() => markReadByThem(message.id), AUTO_READ_DELAY_MS)
    deliverReplies(id, TYPING_START_MS)
  }

  const sendKakaoMessage = useCallback(
    (id: KakaoRoomId, rawText: string) => {
      const text = rawText.trim()
      const p = progressRef.current
      if (!text || !isAutoReplyRoom(id) || !canSend(id, p)) return
      sendAndReply(id, text, (next, sentId) => {
        if (!next.autoReplies[id]) {
          const branch = matchBranch(id, text)
          return branch ? { ...next, autoReplies: { ...next.autoReplies, [id]: { branch, triggerId: sentId } } } : null
        }
        // Ketikan bebas di giliran lanjutan tetap dijawab dengan balasan umum yang nyambung.
        return { ...next, followUps: { ...next.followUps, [id]: [...(next.followUps[id] ?? []), { choice: 'free', sentId }] } }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markReadByThem, deliverReplies],
  )

  const sendKakaoChoice = useCallback(
    (id: KakaoRoomId, index: number) => {
      const p = progressRef.current
      if (!isAutoReplyRoom(id)) return
      const text = replyOptions(id, p)[index]
      if (!text) return
      sendAndReply(id, text, (next, sentId) => {
        if (!next.autoReplies[id]) {
          const branch = index === 0 ? 'A' : 'B'
          return { ...next, autoReplies: { ...next.autoReplies, [id]: { branch, triggerId: sentId } } }
        }
        return { ...next, followUps: { ...next.followUps, [id]: [...(next.followUps[id] ?? []), { choice: index, sentId }] } }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markReadByThem, deliverReplies],
  )

  const rooms = useMemo(() => {
    return kakaoRooms
      .map((room) => ({
        ...room,
        messages: sortMessages([...room.messages, ...progress.addedMessages.filter((m) => m.roomId === room.id)]),
      }))
      .sort((a, b) => {
        const la = a.messages[a.messages.length - 1]
        const lb = b.messages[b.messages.length - 1]
        return toTime(lb.at) - toTime(la.at) || lb.seq - la.seq
      })
  }, [progress.addedMessages])

  const unreadByRoom = useMemo(() => {
    const result: Partial<Record<KakaoRoomId, number>> = {}
    for (const r of kakaoRooms) {
      if (r.initialUnread && !progress.readRooms.includes(r.id)) result[r.id] = r.initialUnread
    }
    for (const m of progress.addedMessages) {
      if (m.from === 'them' && !progress.readMessageIds.includes(m.id)) result[m.roomId] = (result[m.roomId] ?? 0) + 1
    }
    return result
  }, [progress])

  const totalUnread = Object.values(unreadByRoom).reduce((s, n) => s + (n ?? 0), 0)

  const smsNotifications = useMemo<SmsNotification[]>(() => {
    return smsThreads
      .map((thread) => ({
        thread,
        unread: thread.messages.filter((m) => m.unread && !progress.readSmsIds.includes(m.id)),
      }))
      .filter((n) => n.unread.length > 0)
      .sort((a, b) => toTime(b.unread[b.unread.length - 1].at) - toTime(a.unread[a.unread.length - 1].at))
  }, [progress.readSmsIds])

  const smsUnreadByThread = useMemo(
    () => Object.fromEntries(smsNotifications.map((n) => [n.thread.id, n.unread.length])),
    [smsNotifications],
  )
  const totalSmsUnread = smsNotifications.reduce((s, n) => s + n.unread.length, 0)

  const markSmsThreadRead = useCallback((id: string) => {
    const p = progressRef.current
    const ids = (smsThreads.find((t) => t.id === id)?.messages ?? [])
      .filter((m) => m.unread && !p.readSmsIds.includes(m.id))
      .map((m) => m.id)
    if (ids.length === 0) return
    const next = { ...p, readSmsIds: [...p.readSmsIds, ...ids] }
    progressRef.current = next
    setProgress(next)
  }, [])

  const value: StoryContext = {
    screen,
    unlock,
    openPasscode: () => setScreen({ kind: 'passcode' }),
    lock: () => {
      pendingSmsThread.current = null
      setBanner(null)
      setKakaoRoomId(null)
      setSmsThreadId(null)
      setScreen({ kind: 'lock' })
    },
    goHome: () => setScreen({ kind: 'home' }),
    openApp: showApp,
    recentApps,
    openSwitcher: () => setScreen({ kind: 'switcher' }),
    closeRecentApp: (app) => setRecentApps((list) => list.filter((a) => a !== app)),
    kakaoRoomId,
    openKakaoRoom: (id) => {
      setKakaoRoomId(id)
      showApp('kakao')
    },
    closeKakaoRoom: () => setKakaoRoomId(null),
    rooms,
    unreadByRoom,
    totalUnread,
    markRoomRead,
    onYhRoomShown,
    onRoomMessagesSeen,
    canSendIn: (id) => canSend(id, progress),
    sendKakaoMessage,
    replyOptions: (id) => replyOptions(id, progress),
    sendKakaoChoice,
    isTypingIn: (id) => isAutoReplyRoom(id) && !!typing[id],
    isUnreadByThem: (m) => m.from === 'me' && m.id.startsWith('sent-') && !progress.readByThemIds.includes(m.id),
    clock: progress.yhCallEnded ? '18.58' : '18.57',
    yhCallEnded: progress.yhCallEnded,
    endYhCall,
    banner,
    dismissBanner: () => setBanner(null),
    openBanner: (b) => {
      setBanner(null)
      setKakaoRoomId(b.roomId)
      showApp('kakao')
    },
    resetStory: () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
      delivering.current = {}
      setTyping({})
      progressRef.current = INITIAL
      setProgress(INITIAL)
      setBanner(null)
      setKakaoRoomId(null)
      setSmsThreadId(null)
      pendingSmsThread.current = null
      setRecentApps([])
      setScreen({ kind: 'lock' })
    },
    cameraUsed: progress.cameraUsed,
    markCameraUsed: () => {
      if (progressRef.current.cameraUsed) return
      const next = { ...progressRef.current, cameraUsed: true }
      progressRef.current = next
      setProgress(next)
    },
    smsThreadId,
    openSmsThread: (id) => {
      setSmsThreadId(id)
      showApp('messages')
    },
    closeSmsThread: () => setSmsThreadId(null),
    openSmsFromLock: (id) => {
      pendingSmsThread.current = id
      setScreen({ kind: 'passcode' })
    },
    markSmsThreadRead,
    smsUnreadByThread,
    totalSmsUnread,
    smsNotifications,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStory() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStory must be used within StoryProvider')
  return ctx
}
