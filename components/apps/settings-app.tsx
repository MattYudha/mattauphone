'use client'

import { withBasePath } from '@/lib/base-path'
import { useState } from 'react'
import {
  Battery,
  Bell,
  Bluetooth,
  ChevronLeft,
  ChevronRight,
  Hand,
  Image as ImageIcon,
  Info,
  Lock,
  Moon,
  Plane,
  RotateCcw,
  Settings,
  Sun,
  Volume2,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell, Avatar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'
import { OWNER } from '@/lib/story/contacts'
import { useStory } from '@/lib/story/store'

type Toggles = Record<'airplane' | 'wifi' | 'bluetooth' | 'silent' | 'dnd' | 'sleep' | 'notifPreview' | 'autoBright', boolean>

type PageId = 'wifi' | 'bluetooth' | 'notifications' | 'sound' | 'focus' | 'general' | 'display' | 'wallpaper' | 'battery' | 'privacy' | 'about'

const ITEMS: { id: PageId | 'airplane'; label: string; Icon: LucideIcon; color: string }[] = [
  { id: 'airplane', label: 'Mode Pesawat', Icon: Plane, color: '#ff9500' },
  { id: 'wifi', label: 'Wi-Fi', Icon: Wifi, color: '#007aff' },
  { id: 'bluetooth', label: 'Bluetooth', Icon: Bluetooth, color: '#007aff' },
  { id: 'notifications', label: 'Notifikasi', Icon: Bell, color: '#ff3b30' },
  { id: 'sound', label: 'Suara & Haptik', Icon: Volume2, color: '#ff2d55' },
  { id: 'focus', label: 'Fokus', Icon: Moon, color: '#5856d6' },
  { id: 'general', label: 'Umum', Icon: Settings, color: '#8e8e93' },
  { id: 'display', label: 'Layar & Kecerahan', Icon: Sun, color: '#007aff' },
  { id: 'wallpaper', label: 'Wallpaper', Icon: ImageIcon, color: '#34aadc' },
  { id: 'battery', label: 'Baterai', Icon: Battery, color: '#34c759' },
  { id: 'privacy', label: 'Privasi & Keamanan', Icon: Hand, color: '#007aff' },
]

export function SettingsApp() {
  const { lock, resetStory } = useStory()
  const [page, setPage] = useState<PageId | null>(null)
  const [toggles, setToggles] = useState<Toggles>({
    airplane: false,
    wifi: true,
    bluetooth: true,
    silent: false,
    dnd: false,
    sleep: false,
    notifPreview: true,
    autoBright: true,
  })
  const flip = (k: keyof Toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }))
  useBackHandler(!!page, () => setPage(null))

  if (page) {
    const item = ITEMS.find((i) => i.id === page)
    return (
      <SubPage title={page === 'about' ? 'Tentang Website Ini' : item!.label} onBack={() => setPage(null)}>
        <PageBody page={page} toggles={toggles} flip={flip} />
      </SubPage>
    )
  }

  const value = (id: PageId | 'airplane') =>
    id === 'wifi' ? (toggles.wifi && !toggles.airplane ? 'YoungwonPiano_5G' : 'Mati') : id === 'bluetooth' ? (toggles.bluetooth ? 'Nyala' : 'Mati') : undefined

  return (
    <AppShell
      className="bg-[#f2f2f7]"
      header={
        <header className="shrink-0 px-4 pb-2">
          <h2 className="text-[32px] font-bold">Pengaturan</h2>
        </header>
      }
    >
      <div className="flex flex-col gap-6 px-4 pb-6">
        <section className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3">
          <Avatar initial="W" color="#9aa3ad" size={56} src={OWNER.photo} />
          <div>
            <p className="text-[19px] font-semibold">{OWNER.deviceName}</p>
            <p className="text-[13px] text-black/45">Akun Apple, iCloud, dan lainnya</p>
          </div>
        </section>

        <Group>
          {ITEMS.map((item) =>
            item.id === 'airplane' ? (
              <Row key={item.id} Icon={item.Icon} color={item.color} label={item.label}>
                <Toggle label={item.label} on={toggles.airplane} onChange={() => flip('airplane')} />
              </Row>
            ) : (
              <Row
                key={item.id}
                Icon={item.Icon}
                color={item.color}
                label={item.label}
                value={value(item.id)}
                onClick={() => setPage(item.id as PageId)}
              />
            ),
          )}
        </Group>

        <Group>
          <Row Icon={Info} color="#8e8e93" label="Tentang Website Ini" onClick={() => setPage('about')} />
          <Row Icon={RotateCcw} color="#ff9500" label="Mulai Ulang Cerita" onClick={resetStory} />
          <Row Icon={Lock} color="#1c1c1e" label="Ke Layar Kunci" onClick={lock} />
        </Group>
      </div>
    </AppShell>
  )
}

const BT_DEVICES = [
  'AirPods Pro Kim Wonpil',
  'MacBook Kwp',
  'JBL Sound Speaker',
  "YoungHyun's BMW",
  'Surround Ruang Tamu',
  'Headset BOSE Wonpil',
]

function SubPage({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <AppShell
      className="animate-push-in bg-[#f2f2f7]"
      header={
        <header className="relative flex h-11 shrink-0 items-center justify-center px-1">
          <button type="button" onClick={onBack} className="absolute left-1 flex items-center text-[17px] text-[#007aff]">
            <ChevronLeft className="size-7" />
            Pengaturan
          </button>
          <h2 className="max-w-[55%] truncate text-[17px] font-semibold">{title}</h2>
        </header>
      }
    >
      <div className="flex flex-col gap-6 px-4 pb-6 pt-3">{children}</div>
    </AppShell>
  )
}

function PageBody({ page, toggles, flip }: { page: PageId; toggles: Toggles; flip: (k: keyof Toggles) => void }) {
  switch (page) {
    case 'wifi':
      return (
        <>
          <Group>
            <Row label="Wi-Fi">
              <Toggle label="Wi-Fi" on={toggles.wifi} onChange={() => flip('wifi')} />
            </Row>
            {toggles.wifi && <Row label="YoungwonPiano_5G" value="Tersambung" />}
          </Group>
          <Note>Tombol di layar ini hanya mengubah tampilan di dalam website dan tidak mengakses pengaturan perangkat yang sebenarnya.</Note>
        </>
      )
    case 'bluetooth':
      return (
        <>
          <Group>
            <Row label="Bluetooth">
              <Toggle label="Bluetooth" on={toggles.bluetooth} onChange={() => flip('bluetooth')} />
            </Row>
          </Group>
          {toggles.bluetooth && (
            <section>
              <h3 className="mb-1.5 px-4 text-[13px] uppercase text-black/45">Perangkat Saya</h3>
              <Group>
                {BT_DEVICES.map((d) => (
                  <Row key={d} label={d} value="Tidak Tersambung" />
                ))}
              </Group>
            </section>
          )}
        </>
      )
    case 'notifications':
      return (
        <>
          <Group>
            <Row label="Tampilkan Pratinjau">
              <Toggle label="Tampilkan Pratinjau" on={toggles.notifPreview} onChange={() => flip('notifPreview')} />
            </Row>
          </Group>
          <Group>
            <Row label="KakaoTalk" value="Banner" />
            <Row label="Pesan" value="Banner" />
            <Row label="Telepon" value="Banner" />
          </Group>
        </>
      )
    case 'sound':
      return (
        <Group>
          <Row label="Mode Senyap">
            <Toggle label="Mode Senyap" on={toggles.silent} onChange={() => flip('silent')} />
          </Row>
          <Row label="Nada Dering" value="Pembuka" />
        </Group>
      )
    case 'focus':
      return (
        <Group>
          <Row label="Jangan Ganggu">
            <Toggle label="Jangan Ganggu" on={toggles.dnd} onChange={() => flip('dnd')} />
          </Row>
          <Row label="Tidur">
            <Toggle label="Tidur" on={toggles.sleep} onChange={() => flip('sleep')} />
          </Row>
        </Group>
      )
    case 'general':
      return (
        <Group>
          <Row label="Nama" value={OWNER.deviceName} />
          <Row label="Versi Perangkat Lunak" value="26.1" />
          <Row label="Tersedia" value="41.2GB" />
        </Group>
      )
    case 'display':
      return (
        <Group>
          <Row label="Tampilan" value="Terang" />
          <Row label="Kecerahan Otomatis">
            <Toggle label="Kecerahan Otomatis" on={toggles.autoBright} onChange={() => flip('autoBright')} />
          </Row>
        </Group>
      )
    case 'wallpaper':
      return (
        <div className="mx-auto aspect-[9/19] w-32 overflow-hidden rounded-2xl bg-cover bg-center shadow" style={{ backgroundImage: `url(${withBasePath('/images/wallpaper.jpg')})` }} role="img" aria-label="Wallpaper saat ini" />
      )
    case 'battery':
      return (
        <Group>
          <Row label="Sisa Baterai" value="85%" />
          <Row label="Kesehatan Baterai" value="Kapasitas Maksimum 92%" />
        </Group>
      )
    case 'privacy':
      return (
        <>
          <Group>
            <Row label="Layanan Lokasi" value="Mati" />
            <Row label="Kamera" value="Tanpa Akses" />
            <Row label="Kontak" value="Tanpa Akses" />
          </Group>
          <Note>Website ini tidak meminta izin apa pun, termasuk lokasi, kamera, atau kontak.</Note>
        </>
      )
    case 'about':
      return (
        <section className="rounded-[20px] bg-white px-4 py-4 text-[15px] leading-relaxed">
          <p>{"Website ini adalah simulasi HP fiktif untuk ship 'Youngpil'."}</p>
          <p className="mt-2">{"Disusun berdasarkan cerita karya Postype '나의 무심한 다정에게' (Untuk Kelembutanku yang Acuh)."}</p>
        </section>
      )
  }
}

function Group({ children }: { children: React.ReactNode }) {
  return <ul className="overflow-hidden rounded-[20px] bg-white">{children}</ul>
}

function Row({
  label,
  Icon,
  color,
  value,
  onClick,
  children,
}: {
  label: string
  Icon?: LucideIcon
  color?: string
  value?: string
  onClick?: () => void
  children?: React.ReactNode
}) {
  const inner = (
    <>
      {Icon && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px]" style={{ backgroundColor: color }}>
          <Icon className="size-4 text-white" aria-hidden />
        </span>
      )}
      <span className="flex min-h-11 min-w-0 flex-1 items-center gap-2 border-b border-black/10 py-2 pr-4 group-last:border-b-0">
        <span className="flex-1 truncate text-[16px]">{label}</span>
        {value && <span className="max-w-[50%] truncate text-[16px] text-black/45">{value}</span>}
        {children}
        {onClick && <ChevronRight className="size-4 shrink-0 text-black/25" aria-hidden />}
      </span>
    </>
  )
  return (
    <li className="group">
      {onClick ? (
        <button type="button" onClick={onClick} className="flex w-full items-center gap-3 pl-4 text-left active:bg-black/5">
          {inner}
        </button>
      ) : (
        <div className="flex items-center gap-3 pl-4">{inner}</div>
      )}
    </li>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        'relative block h-[31px] w-[51px] shrink-0 overflow-hidden rounded-full p-0 transition-colors',
        on ? 'bg-[#34c759]' : 'bg-[#e9e9eb]',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-0 top-[2px] block size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-out',
          on ? 'translate-x-[22px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="-mt-4 px-4 text-[13px] text-black/45">{children}</p>
}
