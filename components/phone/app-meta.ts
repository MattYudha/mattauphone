import type { AppId } from '@/lib/story/store'

export const APP_LABEL: Record<AppId, string> = {
  kakao: 'KakaoTalk',
  anyai: 'any ai',
  photos: 'Foto',
  settings: 'Pengaturan',
  notes: 'Catatan',
  calendar: 'Kalender',
  clock: 'Jam',
  instagram: 'Instagram',
  voicememos: 'Memo Suara',
  catchtable: 'CatchTable',
  phone: 'Telepon',
  messages: 'Pesan',
  camera: 'Kamera',
  safari: 'Safari',
}

export const APP_IDS = Object.keys(APP_LABEL) as AppId[]
