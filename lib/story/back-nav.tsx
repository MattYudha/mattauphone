'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useIsAppActive } from './app-presence'

type BackStack = { current: Array<() => void> }

const BackNavContext = createContext<BackStack | null>(null)

export function BackNavProvider({ children }: { children: React.ReactNode }) {
  const stack = useRef<Array<() => void>>([])
  const value = useMemo(() => stack, [])
  return <BackNavContext.Provider value={value}>{children}</BackNavContext.Provider>
}

/** Mendaftarkan aksi yang dijalankan tombol Kembali di atas saat sub-layar di dalam aplikasi (ruang chat, halaman detail, dll.) sedang terbuka. */
export function useBackHandler(active: boolean, handler: () => void) {
  const stack = useContext(BackNavContext)
  const latest = useRef(handler)
  // App yang hanya tampil sebagai pratinjau tidak boleh menangkap tombol Kembali.
  const appActive = useIsAppActive()
  const enabled = active && appActive
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    if (!enabled || !stack) return
    const entry = () => latest.current()
    stack.current.push(entry)
    return () => {
      stack.current = stack.current.filter((e) => e !== entry)
    }
  }, [enabled, stack])
}

/** Menutup sub-layar terdaftar yang paling baru. Mengembalikan false jika tidak ada layar yang perlu ditangani. */
export function usePopBack() {
  const stack = useContext(BackNavContext)
  return useCallback(() => {
    const top = stack?.current[stack.current.length - 1]
    if (!top) return false
    top()
    return true
  }, [stack])
}
