'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/phone/chrome'

export function PhotosApp() {
  const [tab, setTab] = useState<'library' | 'albums'>('library')
  return (
    <AppShell
      header={
        <header className="shrink-0 px-4 pb-2">
          <h2 className="text-[32px] font-bold">{tab === 'library' ? '보관함' : '앨범'}</h2>
        </header>
      }
      footer={
        <nav aria-label="사진 탭" className="mx-auto mb-1 flex w-56 shrink-0 rounded-full bg-black/5 p-1 text-[13px] font-medium">
          {(['library', 'albums'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={tab === t ? 'page' : undefined}
              className={cn('flex-1 rounded-full py-1.5', tab === t ? 'bg-white text-[#007aff] shadow-sm' : 'text-black/50')}
            >
              {t === 'library' ? '보관함' : '앨범'}
            </button>
          ))}
        </nav>
      }
      bodyClassName="flex"
    >
      <div className="m-auto flex flex-col items-center px-8 text-center">
        <ImageOff className="size-12 text-black/25" aria-hidden />
        <p className="mt-3 text-xl font-semibold">사진 없음</p>
        <p className="mt-1 text-sm text-black/45">
          {tab === 'library' ? '사진이나 동영상이 없습니다.' : '앨범이 없습니다.'}
        </p>
      </div>
    </AppShell>
  )
}
