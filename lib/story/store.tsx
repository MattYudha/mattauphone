'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { contacts } from './contacts'
import { EVENT_JY_MESSAGES, EVENT_YH_MESSAGES } from './events'
import { kakaoRooms, type KakaoMessage, type KakaoRoom, type KakaoRoomId } from './kakao'
import { toTime } from './time'

export type AppId = 'kakao' | 'messages' | 'phone' | 'photos' | 'settings' | 'safari'
export type Screen = { kind: 'lock' } | { kind: 'passcode' } | { kind: 'home' } | { kind: 'app'; app: AppId }

type StoryProgress = {
  yhArrived: boolean
  jyArrived: boolean
  addedMessages: KakaoMessage[]
  readMessageIds: string[]
}

export type Banner = {
  key: string
  roomId: KakaoRoomId
  sender: string
  lines: string[]
  time: string
}

const STORAGE_KEY = 'wonpil-phone-story-v1'
const INITIAL: StoryProgress = { yhArrived: false, jyArrived: false, addedMessages: [], readMessageIds: [] }

function loadProgress(): StoryProgress {
  if (typeof window === 'undefined') return INITIAL
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw) as StoryProgress
    if (!Array.isArray(parsed.addedMessages) || !Array.isArray(parsed.readMessageIds)) return INITIAL
    return parsed
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
  banner: Banner | null
  dismissBanner: () => void
  openBanner: (banner: Banner) => void
  resetStory: () => void
}

const Ctx = createContext<StoryContext | null>(null)

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'lock' })
  const [kakaoRoomId, setKakaoRoomId] = useState<KakaoRoomId | null>(null)
  const [progress, setProgress] = useState<StoryProgress>(loadProgress)
  const [banner, setBanner] = useState<Banner | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const timers = useRef<number[]>([])

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

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
    setBanner({ key: 'yh', roomId: 'yh', sender: contacts.yh.name, lines: ['퇴근 안했지?'], time: '18:57' })
  }, [])

  const triggerJy = useCallback(() => {
    const p = progressRef.current
    if (!p.yhArrived || p.jyArrived) return
    const next = { ...p, jyArrived: true, addedMessages: [...p.addedMessages, ...EVENT_JY_MESSAGES] }
    progressRef.current = next
    setProgress(next)
    setBanner({
      key: 'jy',
      roomId: 'jy',
      sender: contacts.jy.name,
      lines: ['원필씨', '나 학원 주차장 도착했어요~'],
      time: '18:57',
    })
  }, [])

  const unlock = useCallback(() => {
    setScreen({ kind: 'home' })
    if (!progressRef.current.yhArrived) schedule(triggerYh, 900)
  }, [triggerYh])

  const onYhRoomShown = useCallback(() => {
    const p = progressRef.current
    if (p.yhArrived && !p.jyArrived) schedule(triggerJy, 1200)
  }, [triggerJy])

  const markRoomRead = useCallback((id: KakaoRoomId) => {
    const p = progressRef.current
    const unreadIds = p.addedMessages
      .filter((m) => m.roomId === id && !p.readMessageIds.includes(m.id))
      .map((m) => m.id)
    if (unreadIds.length === 0) return
    const next = { ...p, readMessageIds: [...p.readMessageIds, ...unreadIds] }
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
    for (const m of progress.addedMessages) {
      if (!progress.readMessageIds.includes(m.id)) result[m.roomId] = (result[m.roomId] ?? 0) + 1
    }
    return result
  }, [progress])

  const totalUnread = Object.values(unreadByRoom).reduce((s, n) => s + (n ?? 0), 0)

  const value: StoryContext = {
    screen,
    unlock,
    openPasscode: () => setScreen({ kind: 'passcode' }),
    lock: () => {
      setBanner(null)
      setKakaoRoomId(null)
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
      setScreen({ kind: 'lock' })
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStory() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStory must be used within StoryProvider')
  return ctx
}
