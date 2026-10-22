'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Clock, Copy, Lock, RotateCw, Search, Share, X } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { recentSearches } from '@/lib/story/search'
import { useBackHandler } from '@/lib/story/back-nav'
import { withBasePath } from '@/lib/base-path'
import { KinPost } from './naver/kin-post'
import { DepressionResults } from './naver/depression-results'
import { FlightResults } from './naver/flight-results'
import { OriginalWorkResults } from './naver/original-work-results'
import { HansungResults } from './naver/hansung-results'
import { ChatGptResults } from './naver/chatgpt-results'
import { AkboResults, AkboSite } from './naver/akbo-results'
import { KoreanAirResults } from './naver/koreanair-results'
import { useStory } from '@/lib/story/store'

type View = { kind: 'portal' } | { kind: 'search' } | { kind: 'preview'; query: string } | { kind: 'akbo' }

const MENU = ['Email', 'Kafe', 'Blog', 'Belanja', 'Berita', 'Peta', 'Saham', 'Webtoon']

export function SafariApp() {
  const [stack, setStack] = useState<View[]>([{ kind: 'portal' }])
  const view = stack[stack.length - 1]
  const push = (v: View) => setStack((s) => [...s, v])
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  useBackHandler(stack.length > 1, back)

  const address =
    view.kind === 'preview' ? `m.search.naver.com` : view.kind === 'akbo' ? 'Akbo Segye' : 'm.naver.com'

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {view.kind === 'portal' && <Portal onSearch={() => push({ kind: 'search' })} />}
        {view.kind === 'search' && (
          <SearchPanel onCancel={back} onSubmit={(q) => push({ kind: 'preview', query: q })} />
        )}
        {view.kind === 'preview' && (
          <Preview query={view.query} onSearch={() => push({ kind: 'search' })} onOpenAkbo={() => push({ kind: 'akbo' })} />
        )}
        {view.kind === 'akbo' && <AkboSite />}
      </div>
      <div className="shrink-0 border-t border-black/[0.06] bg-[#f9f9f9]/95 px-3 pb-0 pt-2 backdrop-blur">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] shadow-[0_1px_6px_rgba(0,0,0,0.12)]">
          <span className="text-[13px] font-semibold" aria-hidden>
            AA
          </span>
          <span className="flex flex-1 items-center justify-center gap-1">
            <Lock className="size-3 text-black/50" aria-hidden />
            {address}
          </span>
          <RotateCw className="size-4" aria-hidden />
        </div>
        <nav aria-label="Alat Safari" className="flex items-center justify-between px-3 py-2 text-[#007aff]">
          <button type="button" onClick={back} disabled={stack.length === 1} aria-label="Kembali" className="p-1 disabled:text-black/20">
            <ChevronLeft className="size-6" />
          </button>
          <span aria-hidden className="p-1 text-black/20">
            <ChevronRight className="size-6" />
          </span>
          <span aria-hidden className="p-1 text-black/20">
            <Share className="size-5" />
          </span>
          <span aria-hidden className="p-1 text-black/20">
            <BookOpen className="size-5" />
          </span>
          <span aria-hidden className="p-1 text-black/20">
            <Copy className="size-5" />
          </span>
        </nav>
      </div>
      <HomeIndicator className="bg-[#f7f7f7]" />
    </div>
  )
}

function NaverN({ className = 'size-7' }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-[7px] bg-[#03c75a] ${className}`} aria-hidden>
      <svg viewBox="0 0 20 20" className="size-[55%] fill-white">
        <path d="M13.6 10.7 6.1 0H0v20h6.4V9.3L13.9 20H20V0h-6.4z" />
      </svg>
    </span>
  )
}

const MENU_COLORS: Record<string, string> = {
  Email: '#03c75a',
  Kafe: '#03c75a',
  Blog: '#03c75a',
  Belanja: '#00b843',
  Berita: '#2d7cf6',
  Peta: '#00c4b4',
  Saham: '#f04f4f',
  Webtoon: '#00dc64',
}

const FEED_TABS = ['Beranda', 'Belanja', 'Berita', 'Ekonomi', 'Hiburan', 'Olahraga', 'Webtoon']

function Portal({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="pb-6">
      <div className="bg-white px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onSearch}
          className="flex w-full items-center gap-2.5 rounded-[12px] border-[2px] border-[#03c75a] py-2 pl-2 pr-3 text-left shadow-[0_2px_8px_rgba(3,199,90,0.12)]"
        >
          <NaverN />
          <span className="flex-1 text-[16px] text-black/35">Masukkan kata kunci pencarian.</span>
          <Search className="size-[22px] text-[#03c75a]" strokeWidth={2.4} aria-hidden />
        </button>
        <ul className="mt-5 grid grid-cols-4 gap-y-4 text-center text-[12px] text-[#404040]">
          {MENU.map((m) => (
            <li key={m} className="flex flex-col items-center gap-1.5">
              <span
                className="flex size-[46px] items-center justify-center rounded-[16px] text-[15px] font-extrabold text-white"
                style={{ backgroundColor: MENU_COLORS[m] }}
                aria-hidden
              >
                {m.slice(0, 1)}
              </span>
              {m}
            </li>
          ))}
        </ul>
      </div>
      <div className="h-2 bg-[#f1f3f5]" />
      <nav aria-hidden className="no-scrollbar flex gap-5 overflow-x-auto border-b border-black/[0.06] px-4 text-[15px] text-[#777]">
        {FEED_TABS.map((t, i) => (
          <span key={t} className={i === 0 ? 'shrink-0 border-b-2 border-black py-2.5 font-bold text-black' : 'shrink-0 py-2.5'}>
            {t}
          </span>
        ))}
      </nav>
      <section className="mx-4 mt-4 rounded-[14px] border border-black/[0.06] px-4 py-4">
        <p className="text-[13px] text-[#777]">Seongdong-gu, Seoul</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-[32px] font-semibold leading-none tracking-tight">8°</p>
          <p className="text-right text-[13px] leading-snug text-[#555]">
            Cerah · 2° lebih rendah dari kemarin
            <br />
            Debu halus baik · Debu ultrahalus sedang
          </p>
        </div>
      </section>
      <section className="mx-4 mt-3 overflow-hidden rounded-[14px] border border-black/[0.06]" aria-labelledby="portal-news">
        <p className="px-4 pt-3 text-[13px] font-bold text-[#2d7cf6]">Berita</p>
        <img
          src={withBasePath('/images/naver/concert-news.png')}
          alt="Penonton memenuhi venue konser dan lampu panggung"
          className="mt-2 aspect-[16/9] w-full object-cover"
        />
        <div className="px-4 py-3">
          <h2 id="portal-news" className="text-[16px] font-bold leading-snug">
            {"Band andalan Korea 'DAY6', konser kali ini juga ludes terjual..."}
          </h2>
          <p className="mt-1 text-[12.5px] text-black/45">Star News · 32 menit lalu</p>
        </div>
      </section>
    </div>
  )
}

function SearchPanel({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="pb-6">
      <form
        className="flex items-center gap-2 border-b border-black/10 px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) onSubmit(query.trim())
        }}
      >
        <label className="flex flex-1 items-center gap-2 rounded-full border-2 border-[#03c75a] px-3 py-2">
          <span className="sr-only">Kata kunci</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            enterKeyHint="search"
            placeholder="Masukkan kata kunci pencarian."
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/30"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Hapus kata kunci">
              <X className="size-4 text-black/40" />
            </button>
          )}
        </label>
        <button type="button" onClick={onCancel} className="text-[15px] text-black/60">
          Batal
        </button>
      </form>
      <p className="px-4 pb-1 pt-4 text-[13px] font-semibold text-black/50">Pencarian terkini</p>
      <ul>
        {recentSearches.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onSubmit(q)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] active:bg-black/5"
            >
              <Clock className="size-4 shrink-0 text-black/30" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{q}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Alias kueri per halaman hasil. Dicocokkan dalam bentuk ternormalisasi (huruf kecil, tanpa spasi).
 *  Alias Korea asli dipertahankan sebagai cadangan. */
const KIN_QUERIES = [
  'cara blokir cowok yang ngechat nyebelin banget',
  'cara blokir cowok yang ngechat nyebelin',
  'cara blokir cowok nyebelin',
  'cara blokir cowok',
  '개짜증나게 연락하는 남자 차단법',
]
const DEPRESSION_QUERIES = [
  'kalau tiba-tiba ngerasa depresi',
  'kalau tiba-tiba depresi',
  'tiba-tiba ngerasa depresi',
  'tiba-tiba depresi',
  'tiba tiba depresi',
  '갑자기 우울할때',
]
const FLIGHT_QUERIES = [
  'lama penerbangan kanada ke korea',
  'lama penerbangan canada ke korea',
  'penerbangan kanada ke korea',
  'kanada ke korea berapa jam',
  '캐나다에서 한국 비행시간',
]
const ORIGINAL_WORK_QUERIES = ['karya asli latar cerita', 'latar cerita karya asli', 'karya asli', '배경 원작']
const HANSUNG_QUERIES = [
  'jam buka hansung sushi gangnam',
  'jam buka hansung sushi',
  'hansung sushi gangnam',
  'hansung sushi',
  '강남 한성초밥 영업시간',
  '한성초밥 영업시간',
  '강남 한성초밥',
]
const CHATGPT_QUERIES = ['chatgpt', 'chat gpt', 'cetgpt', '챗지피티', '쳇지피티', '챗gpt']
const AKBO_QUERIES = ['Akbo Segye', 'akbo', '악보세계']
const KOREANAIR_QUERIES = ['Korean Air', '대한항공']

const normalizeQuery = (q: string) => q.replace(/\s+/g, '').toLowerCase()
const matches = (normalized: string, aliases: string[]) => aliases.some((a) => normalizeQuery(a) === normalized)

function Preview({ query, onSearch, onOpenAkbo }: { query: string; onSearch: () => void; onOpenAkbo: () => void }) {
  const { openApp } = useStory()
  const normalized = normalizeQuery(query)
  return (
    <div className="pb-6">
      <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <NaverN className="size-6" />
        <button
          type="button"
          onClick={onSearch}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border-2 border-[#03c75a] px-3 py-2 text-left text-[15px]"
        >
          <span className="min-w-0 flex-1 truncate">{query}</span>
          <Search className="size-4 shrink-0 text-[#03c75a]" aria-hidden />
        </button>
      </div>
      <div className="flex gap-4 border-b border-black/10 px-4 py-2 text-[14px] text-black/40" aria-hidden>
        <span className="border-b-2 border-black pb-1 font-semibold text-black">Semua</span>
        <span>Gambar</span>
        <span>VIEW</span>
        <span>KnowledgeiN</span>
      </div>
      {matches(normalized, KIN_QUERIES) ? (
        <KinPost />
      ) : matches(normalized, DEPRESSION_QUERIES) ? (
        <DepressionResults />
      ) : matches(normalized, FLIGHT_QUERIES) ? (
        <FlightResults />
      ) : matches(normalized, ORIGINAL_WORK_QUERIES) ? (
        <OriginalWorkResults />
      ) : matches(normalized, HANSUNG_QUERIES) ? (
        <HansungResults />
      ) : matches(normalized, CHATGPT_QUERIES) ? (
        <ChatGptResults onOpenAnyAi={() => openApp('anyai')} />
      ) : matches(normalized, AKBO_QUERIES) ? (
        <AkboResults onOpenSite={onOpenAkbo} />
      ) : matches(normalized, KOREANAIR_QUERIES) ? (
        <KoreanAirResults />
      ) : (
        <NoResults query={query} />
      )}
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
      <div className="px-5 pt-10">
        <p className="text-[16px] font-semibold leading-snug">
          Tidak ada hasil pencarian untuk <span className="text-[#03c75a]">{`'${query}'`}</span>.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[13.5px] text-[#666]">
          <li>Pastikan ejaan kata yang kamu masukkan sudah benar.</li>
          <li>Coba kurangi jumlah kata, atau cari lagi dengan kata kunci yang lebih umum.</li>
          <li>Kalau kata kuncinya terdiri dari dua kata atau lebih, periksa lagi spasinya.</li>
        </ul>
      </div>
  )
}
