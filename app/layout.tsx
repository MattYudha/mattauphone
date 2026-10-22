import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { withBasePath } from '@/lib/base-path'
import './globals.css'

const isGithubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true'

const noto = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto' })

export const metadata: Metadata = {
  title: 'iphone Kim Wonpil',
  description: 'Kisah fiktif yang mengikuti jejak-jejak di dalam sebuah iPhone',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: withBasePath('/icon-light-32x32.png'), media: '(prefers-color-scheme: light)' },
      { url: withBasePath('/icon-dark-32x32.png'), media: '(prefers-color-scheme: dark)' },
      { url: withBasePath('/icon.svg'), type: 'image/svg+xml' },
    ],
    apple: withBasePath('/apple-icon.png'),
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  themeColor: '#1c1c1e',
}

// Browser internal Termul menyuntikkan skrip yang perintahnya ditolak ACL milik Termul sendiri.
// Rejection itu bukan dari aplikasi, jadi diredam sebelum overlay error Next.js menangkapnya.
const IGNORE_HOST_ACL_ERRORS = `window.addEventListener('unhandledrejection',function(e){var r=e.reason;var m=String((r&&r.message)||r);if(m.indexOf('not allowed by ACL')!==-1){e.preventDefault();e.stopImmediatePropagation()}})`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={noto.variable}>
      <head>
        {process.env.NODE_ENV === 'development' && <script dangerouslySetInnerHTML={{ __html: IGNORE_HOST_ACL_ERRORS }} />}
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && !isGithubPages && <Analytics />}
      </body>
    </html>
  )
}
