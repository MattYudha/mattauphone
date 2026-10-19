'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Clock, Copy, Lock, Search, Share, X } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { recentSearches } from '@/lib/story/search'

type View = { kind: 'portal' } | { kind: 'search' } | { kind: 'preview'; query: string }

const MENU = ['메일', '카페', '블로그', '쇼핑', '뉴스', '지도', '증권', '웹툰']

export function SafariApp() {
  const [stack, setStack] = useState<View[]>([{ kind: 'portal' }])
  const view = stack[stack.length - 1]
  const push = (v: View) => setStack((s) => [...s, v])
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))

  const address =
    view.kind === 'preview' ? `m.search.naver.com` : 'm.naver.com'

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {view.kind === 'portal' && <Portal onSearch={() => push({ kind: 'search' })} />}
        {view.kind === 'search' && (
          <SearchPanel onCancel={back} onSubmit={(q) => push({ kind: 'preview', query: q })} />
        )}
        {view.kind === 'preview' && <Preview query={view.query} onSearch={() => push({ kind: 'search' })} />}
      </div>
      <div className="shrink-0 border-t border-black/10 bg-[#f7f7f7]/95 px-3 pb-0 pt-2 backdrop-blur">
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-black/[0.06] py-2 text-[15px]">
          <Lock className="size-3.5 text-black/50" aria-hidden />
          <span>{address}</span>
        </div>
        <nav aria-label="Safari 도구" className="flex items-center justify-between px-3 py-2 text-[#007aff]">
          <button type="button" onClick={back} disabled={stack.length === 1} aria-label="뒤로" className="p-1 disabled:text-black/20">
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

function NaverLogo() {
  return <span className="text-[26px] font-black tracking-tight text-[#03c75a]">NAVER</span>
}

function Portal({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="px-4 pb-6 pt-6">
      <div className="flex justify-center">
        <NaverLogo />
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="mt-4 flex w-full items-center gap-2 rounded-full border-2 border-[#03c75a] px-4 py-3 text-left text-[15px] text-black/35"
      >
        <span className="flex-1">검색어를 입력해 주세요.</span>
        <Search className="size-5 text-[#03c75a]" aria-hidden />
      </button>
      <ul className="mt-6 grid grid-cols-4 gap-y-4 text-center text-[12px] text-black/70">
        {MENU.map((m) => (
          <li key={m} className="flex flex-col items-center gap-1.5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f1f3f5] text-sm font-bold text-[#03c75a]" aria-hidden>
              {m.slice(0, 1)}
            </span>
            {m}
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-2xl bg-[#f5f6f8] px-4 py-5 text-center text-[13px] text-black/40">
        체험용 시작 페이지입니다. 외부 사이트로 연결되지 않습니다.
      </div>
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
          <span className="sr-only">검색어</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            enterKeyHint="search"
            placeholder="검색어를 입력해 주세요."
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/30"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기">
              <X className="size-4 text-black/40" />
            </button>
          )}
        </label>
        <button type="button" onClick={onCancel} className="text-[15px] text-black/60">
          취소
        </button>
      </form>
      <p className="px-4 pb-1 pt-4 text-[13px] font-semibold text-black/50">최근 검색어</p>
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

function Preview({ query, onSearch }: { query: string; onSearch: () => void }) {
  return (
    <div className="pb-6">
      <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <span className="text-lg font-black text-[#03c75a]">N</span>
        <button
          type="button"
          onClick={onSearch}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-[#03c75a] px-3 py-2 text-left text-[15px]"
        >
          <span className="min-w-0 flex-1 truncate">{query}</span>
          <Search className="size-4 shrink-0 text-[#03c75a]" aria-hidden />
        </button>
      </div>
      <div className="flex gap-4 border-b border-black/10 px-4 py-2 text-[14px] text-black/40" aria-hidden>
        <span className="border-b-2 border-black pb-1 font-semibold text-black">통합</span>
        <span>이미지</span>
        <span>VIEW</span>
        <span>지식iN</span>
      </div>
      <div className="mx-4 mt-6 rounded-2xl bg-[#f5f6f8] px-5 py-8 text-center">
        <Search className="mx-auto size-8 text-black/20" aria-hidden />
        <p className="mt-3 text-[15px] font-semibold">{`'${query}'`} 검색 미리보기</p>
        <p className="mt-2 text-[13px] leading-relaxed text-black/45">
          체험용 웹사이트 내부의 미리보기 화면입니다. 실제 검색 결과는 표시하지 않습니다.
        </p>
      </div>
    </div>
  )
}
