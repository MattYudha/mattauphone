import { withBasePath } from '@/lib/base-path'

export type ContactId =
  | 'yh'
  | 'hs'
  | 'jy'
  | 'wa'
  | 'unknown'
  | 'pres'
  | 'seungaMom'
  | 'yuchanMom'
  | 'jihooMom'
  | 'jihoo'
  | 'hyundai'
  | 'cj'
  | 'kakaopay'
  | 'supreme'
  | 'hyundaiDept'
  | 'yhSms'

export type Contact = {
  id: ContactId
  name: string
  initial: string
  color: string
  label?: string
  photo?: string
}

const DEFAULT_PHOTO = withBasePath('/images/profiles/default.jpeg')

export const OWNER = {
  name: '김원필',
  friendListName: '나',
  deviceName: '김원필의 iphone',
  status: '영원피아노',
  photo: withBasePath('/images/profiles/me.jpeg'),
}

export const contacts: Record<ContactId, Contact> = {
  yh: { id: 'yh', name: '영현이형❤️', initial: '영', color: '#8fa7c4', label: '휴대전화', photo: withBasePath('/images/profiles/yh.jpeg') },
  hs: { id: 'hs', name: '개똥차ㅗ', initial: '개', color: '#b9a99a', label: '휴대전화', photo: DEFAULT_PHOTO },
  jy: { id: 'jy', name: '우준영', initial: '우', color: '#9cb59a', label: '휴대전화', photo: DEFAULT_PHOTO },
  wa: { id: 'wa', name: '김원아', initial: '원', color: '#c8a2a8', label: '휴대전화', photo: withBasePath('/images/profiles/wa.png') },
  unknown: { id: 'unknown', name: '(알 수 없음)', initial: '', color: '#c5ccd4' },
  pres: { id: 'pres', name: '사과대 회장', initial: '사', color: '#a9a3c6', label: '휴대전화', photo: DEFAULT_PHOTO },
  seungaMom: { id: 'seungaMom', name: '승아 어머님', initial: '승', color: '#e0a77a', label: '휴대전화' },
  yuchanMom: { id: 'yuchanMom', name: '유찬이 어머님', initial: '유', color: '#7fb3b0', label: '휴대전화' },
  jihooMom: { id: 'jihooMom', name: '지후 어머님', initial: '지', color: '#d4b26a', label: '휴대전화' },
  jihoo: { id: 'jihoo', name: '오후반 지후', initial: '지', color: '#86a8d8', label: '휴대전화' },
  hyundai: { id: 'hyundai', name: '현대카드', initial: '현', color: '#3a3a3c' },
  cj: { id: 'cj', name: '대한통운 배송', initial: '대', color: '#d94b3b' },
  kakaopay: { id: 'kakaopay', name: '카카오페이', initial: '카', color: '#ffeb00', photo: withBasePath('/images/profiles/kakaopay.png') },
  supreme: { id: 'supreme', name: 'Supreme', initial: 'S', color: '#e1251b', photo: withBasePath('/images/profiles/supreme.jpeg') },
  hyundaiDept: { id: 'hyundaiDept', name: '현대백화점', initial: '현', color: '#2f4f46' },
  /** 문자 앱에서 01012190482 번호와 매칭되는 연락처 이름 */
  yhSms: { id: 'yhSms', name: '강영현', initial: '강', color: '#8fa7c4', label: '휴대전화', photo: withBasePath('/images/profiles/yh.jpeg') },
}
