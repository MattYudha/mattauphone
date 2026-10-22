'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Folder, Pause, Play, RotateCcw, RotateCw, Trash2, Waves } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'
import { withBasePath } from '@/lib/base-path'

type Memo = { id: string; title: string; date: string; duration: number; src: string; left: string }

const TRASHED: Memo[] = [
  { id: 'm3', title: 'Memo Suara_3', date: '14 Nov 2025', duration: 15, src: '/sounds/memos/memo-3.mp3', left: '25 hari lagi' },
  { id: 'm2', title: 'Memo Suara_2', date: '9 Nov 2025', duration: 4, src: '/sounds/memos/memo-2.mp3', left: '20 hari lagi' },
  { id: 'm1', title: 'Memo Suara_1', date: '2 Nov 2025', duration: 2, src: '/sounds/memos/memo-1.mp3', left: '13 hari lagi' },
]

type Folder = 'root' | 'all' | 'trash'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function VoiceMemosApp() {
  const [folder, setFolder] = useState<Folder>('root')
  useBackHandler(folder !== 'root', () => setFolder('root'))

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <StatusBar tone="light" />
      {folder === 'root' ? (
        <FolderList onOpen={setFolder} />
      ) : (
        <FolderView folder={folder} onBack={() => setFolder('root')} />
      )}
      <HomeIndicator tone="light" className="bg-black" />
    </div>
  )
}

function FolderList({ onOpen }: { onOpen: (f: Folder) => void }) {
  const rows: { id: Folder; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Semua Rekaman', count: 0, icon: <Waves className="size-[22px] text-[#0a84ff]" /> },
    { id: 'trash', label: 'Baru Dihapus', count: TRASHED.length, icon: <Trash2 className="size-[22px] text-[#0a84ff]" /> },
  ]
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4">
      <div className="flex justify-end py-2 text-[17px] text-[#0a84ff]" aria-hidden>
        Edit
      </div>
      <h1 className="pb-4 text-[34px] font-bold tracking-tight">Memo Suara</h1>
      <ul className="overflow-hidden rounded-[12px] bg-[#1c1c1e]">
        {rows.map((r, i) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r.id)}
              className="flex w-full items-center gap-3.5 pl-4 text-left active:bg-white/10"
            >
              <span aria-hidden>{r.icon}</span>
              <span className={`flex flex-1 items-center gap-2 py-3 pr-3 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                <span className="flex-1 text-[17px]">{r.id === 'trash' ? 'Sampah' : r.label}</span>
                <span className="text-[17px] text-white/45">{r.count}</span>
                <ChevronRight className="size-5 text-white/30" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-2 px-1 text-[13px] text-white/40">
        <Folder className="size-4" aria-hidden />
        Tidak ada folder saya
      </p>
    </div>
  )
}

function FolderView({ folder, onBack }: { folder: Exclude<Folder, 'root'>; onBack: () => void }) {
  const items = folder === 'trash' ? TRASHED : []
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-2 py-2 text-[17px] text-[#0a84ff]">
        <button type="button" onClick={onBack} className="flex items-center">
          <ChevronLeft className="size-7" aria-hidden />
          Memo Suara
        </button>
        <span className="px-2" aria-hidden>
          Edit
        </span>
      </div>
      <h1 className="px-4 pb-2 text-[34px] font-bold tracking-tight">{folder === 'trash' ? 'Sampah' : 'Semua Rekaman'}</h1>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
          <p className="text-[22px] font-bold">Tidak Ada Rekaman</p>
          <p className="mt-1 text-[15px] text-white/50">Memo suara yang Anda rekam akan muncul di sini.</p>
        </div>
      ) : (
        <>
          <p className="px-4 pb-2 text-[13px] text-white/45">Item ditampilkan selama 30 hari sebelum dihapus.</p>
          <ul className="min-h-0 flex-1 overflow-y-auto px-4">
            {items.map((m) => (
              <MemoRow key={m.id} memo={m} open={openId === m.id} onToggle={() => setOpenId((id) => (id === m.id ? null : m.id))} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function MemoRow({ memo, open, onToggle }: { memo: Memo; open: boolean; onToggle: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(memo.duration)

  useEffect(() => {
    if (!open) audioRef.current?.pause()
  }, [open])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }
  const skip = (d: number) => {
    const a = audioRef.current
    if (a) a.currentTime = Math.min(Math.max(0, a.currentTime + d), a.duration || duration)
  }

  return (
    <li className="border-b border-white/10">
      <audio
        ref={audioRef}
        src={withBasePath(memo.src)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full py-3 text-left">
        <p className="text-[17px] font-semibold">{memo.title}</p>
        <p className="mt-0.5 flex justify-between text-[14px] text-white/45">
          <span>{memo.date}</span>
          <span>{open ? memo.left : fmt(duration)}</span>
        </p>
      </button>
      {open && (
        <div className="pb-4">
          <div className="relative h-1 rounded-full bg-white/20">
            <span className="absolute inset-y-0 left-0 rounded-full bg-white/80" style={{ width: `${Math.min(100, (time / duration) * 100)}%` }} />
          </div>
          <p className="mt-1.5 flex justify-between text-[12px] tabular-nums text-white/45">
            <span>{fmt(time)}</span>
            <span>{`-${fmt(Math.max(0, duration - time))}`}</span>
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="w-16" aria-hidden />
            <div className="flex items-center gap-9">
              <button type="button" onClick={() => skip(-15)} aria-label="Mundur 15 detik">
                <RotateCcw className="size-6" />
              </button>
              <button type="button" onClick={toggle} aria-label={playing ? 'Jeda' : 'Putar'}>
                {playing ? <Pause fill="currentColor" className="size-9 fill-white" /> : <Play fill="currentColor" className="size-9 fill-white" />}
              </button>
              <button type="button" onClick={() => skip(15)} aria-label="Maju 15 detik">
                <RotateCw className="size-6" />
              </button>
            </div>
            <span className="w-16 text-right text-[15px] text-[#0a84ff]" aria-hidden>
              Pulihkan
            </span>
          </div>
        </div>
      )}
    </li>
  )
}
