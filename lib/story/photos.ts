import { withBasePath } from '@/lib/base-path'

export type Photo = { id: string; src: string; at: string; alt: string }

export const photos: Photo[] = [
  { id: 'p1', src: withBasePath('/images/photos/1.jpeg'), at: '2025-09-14T23:41:00+09:00', alt: 'Selfie berkemeja hitam sambil berbaring' },
  { id: 'p2', src: withBasePath('/images/photos/2.jpeg'), at: '2025-09-14T23:42:00+09:00', alt: 'Selfie close-up yang buram' },
  { id: 'p3', src: withBasePath('/images/photos/3.jpeg'), at: '2025-10-03T14:20:00+09:00', alt: 'Selfie dari bawah memakai rajutan hitam' },
  { id: 'p4', src: withBasePath('/images/photos/4.jpeg'), at: '2025-10-11T16:05:00+09:00', alt: 'Selfie di samping pohon berbunga di gang' },
  { id: 'p5', src: withBasePath('/images/photos/5.jpeg'), at: '2025-10-26T16:48:00+09:00', alt: 'Foto memejamkan mata di atas jembatan kanal Venesia' },
  { id: 'p6', src: withBasePath('/images/photos/6.jpeg'), at: '2025-11-08T09:12:00+09:00', alt: 'Selfie pagi berselimut sambil berpose V' },
  { id: 'p7', src: withBasePath('/images/photos/7.jpeg'), at: '2025-11-16T19:30:00+09:00', alt: 'Selfie berjaket hitam sambil berpose V' },
  { id: 'p8', src: withBasePath('/images/photos/8.jpeg'), at: '2025-11-18T22:14:00+09:00', alt: 'Foto dengan tangan terulur di latar gelap' },
  { id: 'p9', src: withBasePath('/images/photos/9.jpeg'), at: '2025-11-21T21:03:00+09:00', alt: 'Foto berkaus putih duduk di bangku pada malam hari sambil berpose V' },
  { id: 'p10', src: withBasePath('/images/photos/10.jpeg'), at: '2025-11-24T08:47:00+09:00', alt: 'Selfie di lift memakai jaket puffer hitam' },
]
