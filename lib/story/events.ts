import type { KakaoMessage } from './kakao'
import { NOW_ISO } from './time'

export const EVENT_YH_MESSAGES: KakaoMessage[] = [
  {
    id: 'event-yh-1',
    roomId: 'yh',
    from: 'them',
    at: NOW_ISO,
    seq: 1,
    content: { type: 'text', text: '퇴근 안했지?' },
  },
]

export const EVENT_JY_MESSAGES: KakaoMessage[] = [
  {
    id: 'event-jy-1',
    roomId: 'jy',
    from: 'them',
    at: NOW_ISO,
    seq: 2,
    content: { type: 'text', text: '원필씨' },
  },
  {
    id: 'event-jy-2',
    roomId: 'jy',
    from: 'them',
    at: NOW_ISO,
    seq: 3,
    content: { type: 'text', text: '나 학원 주차장 도착했어요~' },
  },
]
