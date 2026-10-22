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
  name: 'Kim Wonpil',
  friendListName: 'Aku',
  deviceName: 'iphone Kim Wonpil',
  status: 'Youngwon Piano',
  photo: withBasePath('/images/profiles/me.jpeg'),
}

export const contacts: Record<ContactId, Contact> = {
  yh: { id: 'yh', name: 'Younghyun hyung❤️', initial: 'Y', color: '#8fa7c4', label: 'seluler', photo: withBasePath('/images/profiles/yh.jpeg') },
  hs: { id: 'hs', name: 'Si Brengsekㅗ', initial: 'S', color: '#b9a99a', label: 'seluler', photo: DEFAULT_PHOTO },
  jy: { id: 'jy', name: 'Woo Junyoung', initial: 'W', color: '#9cb59a', label: 'seluler', photo: DEFAULT_PHOTO },
  wa: { id: 'wa', name: 'Kim Wona', initial: 'W', color: '#c8a2a8', label: 'seluler', photo: withBasePath('/images/profiles/wa.png') },
  unknown: { id: 'unknown', name: '(Tidak Dikenal)', initial: '', color: '#c5ccd4' },
  pres: { id: 'pres', name: 'Ketua Fakultas Ilmu Sosial', initial: 'K', color: '#a9a3c6', label: 'seluler', photo: DEFAULT_PHOTO },
  seungaMom: { id: 'seungaMom', name: 'Seunga eomeonim', initial: 'S', color: '#e0a77a', label: 'seluler' },
  yuchanMom: { id: 'yuchanMom', name: 'Yuchan eomeonim', initial: 'Y', color: '#7fb3b0', label: 'seluler' },
  jihooMom: { id: 'jihooMom', name: 'Jihoo eomeonim', initial: 'J', color: '#d4b26a', label: 'seluler' },
  jihoo: { id: 'jihoo', name: 'Jihoo (kelas sore)', initial: 'J', color: '#86a8d8', label: 'seluler' },
  hyundai: { id: 'hyundai', name: 'Hyundai Card', initial: 'H', color: '#3a3a3c' },
  cj: { id: 'cj', name: 'CJ Logistics', initial: 'C', color: '#d94b3b' },
  kakaopay: { id: 'kakaopay', name: 'KakaoPay', initial: 'K', color: '#ffeb00', photo: withBasePath('/images/profiles/kakaopay.png') },
  supreme: { id: 'supreme', name: 'Supreme', initial: 'S', color: '#e1251b', photo: withBasePath('/images/profiles/supreme.jpeg') },
  hyundaiDept: { id: 'hyundaiDept', name: 'Hyundai Department Store', initial: 'H', color: '#2f4f46' },
  /** Nama kontak yang cocok dengan nomor 01012190482 di app Pesan */
  yhSms: { id: 'yhSms', name: 'Kang Younghyun', initial: 'K', color: '#8fa7c4', label: 'seluler', photo: withBasePath('/images/profiles/yh.jpeg') },
}
