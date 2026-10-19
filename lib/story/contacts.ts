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

export type Contact = {
  id: ContactId
  name: string
  initial: string
  color: string
  label?: string
  photo?: string
}

const DEFAULT_PHOTO = '/images/profiles/default.jpeg'

export const OWNER = {
  name: '김원필',
  friendListName: '나',
  deviceName: '김원필의 iphone',
  status: '영원피아노',
  photo: '/images/profiles/me.jpeg',
}

export const contacts: Record<ContactId, Contact> = {
  yh: { id: 'yh', name: '영현이형❤️', initial: '영', color: '#8fa7c4', label: '휴대전화', photo: '/images/profiles/yh.jpeg' },
  hs: { id: 'hs', name: '개똥차ㅗ', initial: '개', color: '#b9a99a', label: '휴대전화', photo: DEFAULT_PHOTO },
  jy: { id: 'jy', name: '우준영', initial: '우', color: '#9cb59a', label: '휴대전화', photo: DEFAULT_PHOTO },
  wa: { id: 'wa', name: '김원아', initial: '원', color: '#c8a2a8', label: '휴대전화', photo: '/images/profiles/wa.png' },
  unknown: { id: 'unknown', name: '(알 수 없음)', initial: '', color: '#c5ccd4' },
  pres: { id: 'pres', name: '사과대 회장', initial: '사', color: '#a9a3c6', label: '휴대전화', photo: DEFAULT_PHOTO },
  seungaMom: { id: 'seungaMom', name: '승아 어머님', initial: '승', color: '#e0a77a', label: '휴대전화' },
  yuchanMom: { id: 'yuchanMom', name: '유찬이 어머님', initial: '유', color: '#7fb3b0', label: '휴대전화' },
  jihooMom: { id: 'jihooMom', name: '지후 어머님', initial: '지', color: '#d4b26a', label: '휴대전화' },
  jihoo: { id: 'jihoo', name: '오후반 지후', initial: '지', color: '#86a8d8', label: '휴대전화' },
  hyundai: { id: 'hyundai', name: '현대카드', initial: '현', color: '#3a3a3c' },
  cj: { id: 'cj', name: '대한통운 배송', initial: '대', color: '#d94b3b' },
}
