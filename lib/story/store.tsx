'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { contacts } from './contacts'
import { playSound, unlockSounds } from '@/lib/sound'
import { AFTER_CALL_BANNER_MESSAGES, AFTER_CALL_ROOM_MESSAGES, EVENT_JY_MESSAGES, EVENT_YH_MESSAGES } from './events'
import { kakaoRooms, type KakaoMessage, type KakaoRoom, type KakaoRoomId } from './kakao'
import { smsThreads, type SmsMessage, type SmsThread } from './sms'
import { toTime } from './time'

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
export type Screen = { kind: 'lock' } | { kind: 'passcode' } | { kind: 'home' } | { kind: 'app'; app: AppId }

type StoryProgress = {
  yhArrived: boolean
  jyArrived: boolean
  /** 영현의 전화를 받은 뒤 직접 끊었는지. 이후 시각이 18:58로 바뀐다. */
  yhCallEnded: boolean
  addedMessages: KakaoMessage[]
  readMessageIds: string[]
  /** 처음부터 읽지 않음 상태였던 방 중 사용자가 열어본 방 */
  readRooms: KakaoRoomId[]
  cameraUsed: boolean
  /** 사용자가 대화방을 열어 읽음 처리한 문자 id */
  readSmsIds: string[]
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

const STORAGE_KEY = 'wonpil-phone-story-v1'
const INITIAL: StoryProgress = {
  yhArrived: false,
  jyArrived: false,
  yhCallEnded: false,
  addedMessages: [],
  readMessageIds: [],
  readRooms: [],
  cameraUsed: false,
  readSmsIds: [],
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
  kakaoRoomId: KakaoRoomId | null
  openKakaoRoom: (id: KakaoRoomId) => void
  closeKakaoRoom: () => void
  rooms: KakaoRoom[]
  unreadByRoom: Partial<Record<KakaoRoomId, number>>
  totalUnread: number
  markRoomRead: (id: KakaoRoomId) => void
  onYhRoomShown: () => void
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
  /** 잠금화면 알림에서 진입: 암호 입력 후 해당 문자 대화로 이동 */
  openSmsFromLock: (id: string) => void
  markSmsThreadRead: (id: string) => void
  smsUnreadByThread: Record<string, number>
  totalSmsUnread: number
  smsNotifications: SmsNotification[]
}

const Ctx = createContext<StoryContext | null>(null)

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'lock' })
  const [kakaoRoomId, setKakaoRoomId] = useState<KakaoRoomId | null>(null)
  const [progress, setProgress] = useState<StoryProgress>(loadProgress)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [smsThreadId, setSmsThreadId] = useState<string | null>(null)
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
    window.addEventListener('pointerdown', unlockSounds, { once: true })
    window.addEventListener('keydown', unlockSounds, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockSounds)
      window.removeEventListener('keydown', unlockSounds)
    }
  }, [])

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
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
    setBanner({ key: 'yh', roomId: 'yh', sender: contacts.yh.name, lines: ['퇴근 안했지?'], time: '18:57' })
  }, [])

  /** 메시지를 하나씩 도착시킨다. 이미 도착한 메시지는 건너뛰어 새로고침 후 이어 받을 때도 중복되지 않는다. */
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
              sender: contacts.yh.name,
              lines: [message.content.text],
              time: '18:58',
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
      lines: ['원필씨', '나 학원 주차장 도착했어요~'],
      time: '18:57',
    })
  }, [])

  const unlock = useCallback(() => {
    const target = pendingSmsThread.current
    pendingSmsThread.current = null
    if (target) {
      setSmsThreadId(target)
      setScreen({ kind: 'app', app: 'messages' })
    } else {
      setScreen({ kind: 'home' })
    }
    if (!progressRef.current.yhArrived) schedule(triggerYh, 900)
  }, [triggerYh])

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
      .filter((m) => m.roomId === id && !p.readMessageIds.includes(m.id))
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
      if (!progress.readMessageIds.includes(m.id)) result[m.roomId] = (result[m.roomId] ?? 0) + 1
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
    openApp: (app) => setScreen({ kind: 'app', app }),
    kakaoRoomId,
    openKakaoRoom: (id) => {
      setKakaoRoomId(id)
      setScreen({ kind: 'app', app: 'kakao' })
    },
    closeKakaoRoom: () => setKakaoRoomId(null),
    rooms,
    unreadByRoom,
    totalUnread,
    markRoomRead,
    onYhRoomShown,
    clock: progress.yhCallEnded ? '18:58' : '18:57',
    yhCallEnded: progress.yhCallEnded,
    endYhCall,
    banner,
    dismissBanner: () => setBanner(null),
    openBanner: (b) => {
      setBanner(null)
      setKakaoRoomId(b.roomId)
      setScreen({ kind: 'app', app: 'kakao' })
    },
    resetStory: () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
      progressRef.current = INITIAL
      setProgress(INITIAL)
      setBanner(null)
      setKakaoRoomId(null)
      setSmsThreadId(null)
      pendingSmsThread.current = null
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
      setScreen({ kind: 'app', app: 'messages' })
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
