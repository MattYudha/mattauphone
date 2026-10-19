'use client'

import { ArrowUp, ChevronDown, Copy, Mic, Plus, RefreshCw, SquarePen, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { AppGlyph } from '@/components/phone/app-icons'
import { aiTurns, type AiBlock } from '@/lib/story/anyai'

export function AnyAiApp() {
  return (
    <div className="flex h-full flex-col bg-white text-[#0d0d0d]">
      <StatusBar />
      <header className="flex h-12 shrink-0 items-center justify-between px-3">
        <span className="flex size-9 flex-col items-start justify-center gap-[5px] pl-1.5" aria-hidden>
          <span className="h-[2px] w-[18px] rounded-full bg-current" />
          <span className="h-[2px] w-[12px] rounded-full bg-current" />
        </span>
        <h2 className="flex items-center gap-1 text-[17px] font-semibold">
          any ai
          <ChevronDown className="size-4 text-black/40" aria-hidden />
        </h2>
        <SquarePen className="size-[22px]" strokeWidth={1.8} aria-hidden />
      </header>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {aiTurns.map((turn) => (
          <section key={turn.id} className="flex flex-col gap-5 py-3">
            <p className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-[22px] bg-[#f1f1f1] px-4 py-2.5 text-[15.5px] leading-snug">
              {turn.question}
            </p>
            <div className="flex gap-2.5">
              <span className="mt-0.5 size-7 shrink-0 overflow-hidden rounded-full" aria-hidden>
                <AppGlyph kind="anyai" />
              </span>
              <div className="min-w-0 flex-1">
                <Answer blocks={turn.answer} />
                <div className="mt-3 flex items-center gap-4 text-black/45" aria-hidden>
                  <Copy className="size-[17px]" />
                  <ThumbsUp className="size-[17px]" />
                  <ThumbsDown className="size-[17px]" />
                  <Volume2 className="size-[17px]" />
                  <RefreshCw className="size-[17px]" />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="shrink-0 px-3 pb-1 pt-1">
        <div className="flex items-center gap-2 rounded-[28px] border border-black/10 bg-white px-2.5 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-black/10" aria-hidden>
            <Plus className="size-5" strokeWidth={1.8} />
          </span>
          <input
            disabled
            aria-label="메시지 입력 (사용할 수 없음)"
            placeholder="무엇이든 물어보세요"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40 disabled:cursor-default"
          />
          <Mic className="size-5 shrink-0 text-black/60" aria-hidden />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/15 text-white" aria-hidden>
            <ArrowUp className="size-5" strokeWidth={2.4} />
          </span>
        </div>
        <p className="pt-2 text-center text-[11px] text-black/40">any ai는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.</p>
      </div>
      <HomeIndicator />
    </div>
  )
}

function Answer({ blocks }: { blocks: AiBlock[] }) {
  return (
    <div className="flex flex-col gap-2 text-[15.5px] leading-[1.65]">
      {blocks.map((b, i) =>
        b.type === 'h' ? (
          <h3 key={i} className="mt-2 font-semibold">
            {b.text}
          </h3>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  )
}
