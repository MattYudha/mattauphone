'use client'

import { useState } from 'react'
import { ArrowBigUp, Delete, Globe, Mic, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Tinggi total keyboard (bar QuickType + 4 baris tombol + baris globe/mic). */
export const KEYBOARD_HEIGHT = 300

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

/** Tombol yang sedang "ditekan" — oleh animasi mengetik otomatis atau oleh pengguna. */
export type PressedKey = { key: string; shift?: boolean } | null

/** Tombol keyboard untuk satu karakter teks. Karakter di luar huruf & spasi dianggap dari papan simbol. */
export function keyForChar(ch: string): PressedKey {
  if (ch === ' ') return { key: 'space' }
  const lower = ch.toLowerCase()
  if (/^[a-z]$/.test(lower)) return { key: lower, shift: ch !== lower }
  if (/[ㄱ-ㆎ]/.test(ch)) return { key: 'emoji' }
  return { key: '123' }
}

type Props = {
  suggestions: string[]
  onSuggestion: (index: number) => void
  onKey: (ch: string) => void
  onBackspace: () => void
  onReturn: () => void
  pressed: PressedKey
  /** Selama teks sedang diketik otomatis, tombol & saran tidak bisa dipakai. */
  locked: boolean
  canReturn: boolean
}

export function IosKeyboard({ suggestions, onSuggestion, onKey, onBackspace, onReturn, pressed, locked, canReturn }: Props) {
  const [shift, setShift] = useState(false)
  const [touched, setTouched] = useState<string | null>(null)
  const active = (key: string) => touched === key || pressed?.key === key
  const showUpper = shift || !!pressed?.shift

  // Jangan mencuri fokus dari kolom pesan; umpan balik tekan muncul saat jari menyentuh tombol.
  const press = (key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      if (!locked) setTouched(key)
    },
    onPointerUp: () => setTouched(null),
    onPointerLeave: () => setTouched(null),
    onPointerCancel: () => setTouched(null),
  })

  const letter = (k: string) => (
    <button
      key={k}
      type="button"
      tabIndex={-1}
      disabled={locked}
      {...press(k)}
      onClick={() => {
        onKey(shift ? k.toUpperCase() : k)
        if (shift) setShift(false)
      }}
      className={cn(
        'relative flex h-[42px] flex-1 items-center justify-center rounded-[5px] bg-white text-[22px] text-black shadow-[0_1px_0_#898a8d]',
        active(k) && 'bg-[#e6e7ea]',
      )}
    >
      {showUpper ? k.toUpperCase() : k}
      {active(k) && (
        // Pop-up huruf seperti iOS saat tombol ditekan.
        <span className="pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 flex h-[54px] w-[46px] -translate-x-1/2 items-center justify-center rounded-[8px] bg-white text-[30px] shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
          {showUpper ? k.toUpperCase() : k}
        </span>
      )}
    </button>
  )

  const special = 'flex h-[42px] items-center justify-center rounded-[5px] bg-[#abb0bc] text-black shadow-[0_1px_0_#898a8d]'

  return (
    <div className="flex h-[300px] select-none flex-col bg-[#d1d4da] text-black" role="group" aria-label="Keyboard">
      <div className="flex h-[44px] shrink-0 items-stretch" aria-label="Saran QuickType">
        {suggestions.length > 0 && !locked ? (
          suggestions.map((text, i) => (
            <button
              key={text}
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onSuggestion(i)}
              className={cn(
                'flex min-w-0 flex-1 items-center justify-center px-2.5 text-center text-[13px] leading-tight active:bg-white/50',
                i > 0 && 'border-l border-black/15',
              )}
            >
              <span className="line-clamp-2">{text}</span>
            </button>
          ))
        ) : (
          <span className="flex-1" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[11px] px-[3px] pt-[6px]">
        <div className="flex gap-[6px]">{ROWS[0].split('').map(letter)}</div>
        <div className="flex gap-[6px] px-[19px]">{ROWS[1].split('').map(letter)}</div>
        <div className="flex gap-[6px]">
          <button
            type="button"
            tabIndex={-1}
            disabled={locked}
            {...press('shift')}
            onClick={() => setShift((v) => !v)}
            aria-label="Shift"
            className={cn(special, 'w-[42px] shrink-0', (showUpper || active('shift')) && 'bg-white')}
          >
            <ArrowBigUp className={cn('size-[22px]', showUpper && 'fill-current')} fill={showUpper ? 'currentColor' : 'none'} strokeWidth={1.6} />
          </button>
          <div className="flex flex-1 gap-[6px] px-[6px]">{ROWS[2].split('').map(letter)}</div>
          <button
            type="button"
            tabIndex={-1}
            disabled={locked}
            {...press('back')}
            onClick={onBackspace}
            aria-label="Hapus"
            className={cn(special, 'w-[42px] shrink-0', active('back') && 'bg-white')}
          >
            <Delete className="size-[22px]" strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex gap-[6px]">
          <span className={cn(special, 'w-[44px] shrink-0 text-[16px]', active('123') && 'bg-white')} aria-hidden>
            123
          </span>
          <span className={cn(special, 'w-[44px] shrink-0', active('emoji') && 'bg-white')} aria-hidden>
            <Smile className="size-[22px]" strokeWidth={1.6} />
          </span>
          <button
            type="button"
            tabIndex={-1}
            disabled={locked}
            {...press('space')}
            onClick={() => onKey(' ')}
            className={cn(
              'flex h-[42px] flex-1 items-center justify-center rounded-[5px] bg-white text-[16px] shadow-[0_1px_0_#898a8d]',
              active('space') && 'bg-[#e6e7ea]',
            )}
          >
            spasi
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={locked || !canReturn}
            {...press('return')}
            onClick={onReturn}
            className={cn(
              'flex h-[42px] w-[92px] shrink-0 items-center justify-center rounded-[5px] text-[16px] shadow-[0_1px_0_#898a8d]',
              canReturn && !locked ? 'bg-[#007aff] text-white' : 'bg-[#abb0bc] text-black/40',
              active('return') && 'opacity-80',
            )}
          >
            kirim
          </button>
        </div>
      </div>
      <div className="flex h-[44px] shrink-0 items-center justify-between px-6 text-[#56585e]" aria-hidden>
        <Globe className="size-[24px]" strokeWidth={1.5} />
        <Mic className="size-[24px]" strokeWidth={1.5} />
      </div>
    </div>
  )
}
