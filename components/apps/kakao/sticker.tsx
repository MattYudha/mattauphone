export function Sticker({ kind }: { kind: 'pout' | 'teary' }) {
  return (
    <svg viewBox="0 0 100 100" className="size-24" role="img" aria-label={kind === 'pout' ? '삐진 표정 이모티콘' : '눈물 그렁 이모티콘'}>
      <circle cx="50" cy="52" r="40" fill="#ffd66b" stroke="#3a2a1a" strokeWidth="3" />
      <circle cx="30" cy="62" r="6" fill="#ff9a9a" opacity="0.7" />
      <circle cx="70" cy="62" r="6" fill="#ff9a9a" opacity="0.7" />
      {kind === 'pout' ? (
        <>
          <path d="M28 44 L42 48" stroke="#3a2a1a" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 44 L58 48" stroke="#3a2a1a" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 70 Q50 64 58 70" stroke="#3a2a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M80 22 q4 -6 8 0 q-4 6 -8 0" fill="#ff6b6b" />
        </>
      ) : (
        <>
          <ellipse cx="36" cy="48" rx="6" ry="8" fill="#3a2a1a" />
          <ellipse cx="64" cy="48" rx="6" ry="8" fill="#3a2a1a" />
          <circle cx="38" cy="45" r="2" fill="#fff" />
          <circle cx="66" cy="45" r="2" fill="#fff" />
          <path d="M33 58 q-3 8 0 12 q3 -4 0 -12" fill="#6fc3ff" />
          <path d="M67 58 q-3 8 0 12 q3 -4 0 -12" fill="#6fc3ff" />
          <path d="M43 72 Q50 67 57 72" stroke="#3a2a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
