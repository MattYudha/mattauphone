import type { KakaoMessage } from './kakao'
import { NOW_ISO, kst } from './time'

export const AFTER_CALL_ISO = kst('2025-11-19 18:58')

function yhLines(prefix: string, startSeq: number, lines: string[]): KakaoMessage[] {
  return lines.map((text, i) => ({
    id: `${prefix}-${i + 1}`,
    roomId: 'yh',
    from: 'them',
    at: AFTER_CALL_ISO,
    seq: startSeq + i,
    content: { type: 'text', text },
  }))
}

/** Pesan KakaoTalk yang beruntun masuk lewat banner notifikasi tepat setelah telepon Younghyun ditutup. */
export const AFTER_CALL_BANNER_MESSAGES = yhLines('after-call-a', 10, [
  'Kim Wonpil',
  'Kenapa teleponnya ditutup',
  'Aku lagi jalan ke akademimu',
  'Cek KakaoTalk',
  'Aku tahu kamu baca',
])

/** Pesan KakaoTalk yang menyusul di dalam ruang chat Younghyun setelah pesan di atas diterima dan ruangnya dibuka. */
export const AFTER_CALL_ROOM_MESSAGES = yhLines('after-call-b', 20, ['Kim Wonpil', 'Aku sampai 3 menit lagi', 'Kamu nggak ketemu Woo Junyoung, kan?'])

export const EVENT_YH_MESSAGES: KakaoMessage[] = [
  {
    id: 'event-yh-1',
    roomId: 'yh',
    from: 'them',
    at: NOW_ISO,
    seq: 1,
    content: { type: 'text', text: 'Belum pulang kerja, kan?' },
  },
]

export const EVENT_JY_MESSAGES: KakaoMessage[] = [
  {
    id: 'event-jy-1',
    roomId: 'jy',
    from: 'them',
    at: NOW_ISO,
    seq: 2,
    content: { type: 'text', text: 'Wonpil-ssi' },
  },
  {
    id: 'event-jy-2',
    roomId: 'jy',
    from: 'them',
    at: NOW_ISO,
    seq: 3,
    content: { type: 'text', text: 'Aku udah sampai di parkiran akademi~' },
  },
]
