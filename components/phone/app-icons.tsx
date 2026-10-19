import { Camera, Compass, MessageCircle, Phone, Settings } from 'lucide-react'

export type IconKind = 'kakao' | 'photos' | 'settings' | 'phone' | 'messages' | 'camera' | 'safari'

const base = 'relative flex size-full items-center justify-center overflow-hidden rounded-[23%] shadow-sm'

export function AppGlyph({ kind }: { kind: IconKind }) {
  switch (kind) {
    case 'kakao':
      return (
        <span className={base} style={{ backgroundColor: '#fee500' }}>
          <span className="relative flex h-[52%] w-[66%] items-center justify-center rounded-[50%] bg-[#3a1d1d]">
            <span className="text-[9px] font-black tracking-tight text-[#fee500]">TALK</span>
            <span className="absolute -bottom-[3px] left-[22%] size-0 border-x-[4px] border-t-[6px] border-x-transparent border-t-[#3a1d1d]" />
          </span>
        </span>
      )
    case 'photos':
      return (
        <span className={`${base} bg-white`}>
          <span
            className="size-[70%] rounded-full"
            style={{
              background:
                'conic-gradient(#f9c440, #f7893b, #ea4f5b, #c94fa0, #7e5bd6, #4a8ff0, #3cc3c8, #66cc5b, #f9c440)',
              maskImage: 'radial-gradient(circle, transparent 18%, black 19%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 18%, black 19%)',
            }}
          />
        </span>
      )
    case 'settings':
      return (
        <span className={base} style={{ background: 'linear-gradient(#b8bcc4, #7d828c)' }}>
          <Settings className="size-[68%] text-[#3b3d42]" strokeWidth={1.6} />
        </span>
      )
    case 'phone':
      return (
        <span className={base} style={{ background: 'linear-gradient(#6ee36a, #2fbe3a)' }}>
          <Phone className="size-[52%] fill-white text-white" />
        </span>
      )
    case 'messages':
      return (
        <span className={base} style={{ background: 'linear-gradient(#6ee36a, #2fbe3a)' }}>
          <MessageCircle className="size-[60%] fill-white text-white" />
        </span>
      )
    case 'camera':
      return (
        <span className={base} style={{ background: 'linear-gradient(#e6e7ea, #a9adb4)' }}>
          <Camera className="size-[55%] text-[#2c2c2e]" strokeWidth={1.8} />
        </span>
      )
    case 'safari':
      return (
        <span className={`${base} bg-white`}>
          <Compass className="size-[78%] text-[#1a8cf5]" strokeWidth={1.4} />
        </span>
      )
  }
}
