'use client'

import { createContext, useContext } from 'react'

/**
 * 'active'  : app sedang dipakai di layar penuh.
 * 'preview' : app tampil sebagai kartu (App Switcher / animasi) dan tidak boleh memicu efek cerita
 *             seperti menandai pesan terbaca atau memakai kamera.
 * App yang tersembunyi dibungkus <Activity mode="hidden"> sehingga efeknya tidak berjalan sama sekali.
 */
export type AppPresence = 'active' | 'preview'

const PresenceContext = createContext<AppPresence>('active')

export const AppPresenceProvider = PresenceContext.Provider

export function useAppPresence() {
  return useContext(PresenceContext)
}

export function useIsAppActive() {
  return useContext(PresenceContext) === 'active'
}
