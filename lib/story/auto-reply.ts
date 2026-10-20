import type { KakaoRoomId } from './kakao'

export type AutoReplyRoom = 'yh' | 'jy'
export type AutoReplyBranch = 'A' | 'B'
export type AutoReplyState = { branch: AutoReplyBranch; triggerId: string }

type Rule = { branch: AutoReplyBranch; phrases: string[]; replies: string[] }

/** 방마다 우선순위 순서로 나열한다. 앞의 규칙이 먼저 일치하면 그 분기로 고정된다. */
const RULES: Record<AutoReplyRoom, Rule[]> = {
  yh: [
    { branch: 'A', phrases: ['아니야', '뭔소리야', '안만났는데'], replies: ['알았어', '그럼 일단 학원 주차장에서 기다려'] },
    { branch: 'B', phrases: ['맞는데', '우준영 만났어', '우준영 만날거야'], replies: ['김원필', '그 새끼 만나지마', '나 지금 가고 있다고'] },
  ],
  jy: [
    {
      branch: 'A',
      phrases: ['그만 만나요', '그만 만나', '가세요', '싫어요', '싫어', '오지 마', '안 좋아요', '만나기 싫어요'],
      replies: ['네?', '원필 씨 갑자기 왜그래요'],
    },
    {
      branch: 'B',
      phrases: ['좋아요', '빨리와요', '빨리 와', '보고 싶어요', '기다릴게요'],
      replies: ['원필 씨 오늘 기분 좋은가봐요 ㅎㅎ', '나랑 저녁 먹어서 그런가?'],
    },
  ],
}

/** 띄어쓰기·문장부호·기호를 모두 제거해 표현 포함 여부만 비교한다. */
const normalize = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '')

export function isAutoReplyRoom(id: KakaoRoomId): id is AutoReplyRoom {
  return id === 'yh' || id === 'jy'
}

const PROFANITY = [
  '씨발', '시발', '씨벌', '시벌', '시바', '씨바', 'ㅅㅂ', 'ㅆㅂ', '시발놈', '씨발놈', '개새끼', '개새', '새끼',
  '병신', '븅신', 'ㅂㅅ', 'ㅄ', '지랄', 'ㅈㄹ', '좆', '좃', '존나', '졸라', '꺼져', '꺼지세요', '닥쳐', '닥치세요',
  '엿먹어', '엿같아', '좆같아', '개같아', '미친놈', '미친새끼', '개소리', '개지랄',
].map(normalize)

/** 욕설 표현을 품고 있지만 일반 단어인 경우. 판별 전에 지워서 오탐을 막는다. */
const PROFANITY_SAFE_WORDS = ['시발점', '시바견', '시바이누', '새끼손가락', '새끼발가락'].map(normalize)

function hasProfanity(n: string): boolean {
  const cleaned = PROFANITY_SAFE_WORDS.reduce((s, w) => s.split(w).join(''), n)
  return PROFANITY.some((p) => cleaned.includes(p))
}

export function matchBranch(room: AutoReplyRoom, text: string): AutoReplyBranch | null {
  const n = normalize(text)
  if (room === 'jy' && hasProfanity(n)) return 'A'
  const rule = RULES[room].find((r) => r.phrases.some((p) => n.includes(normalize(p))))
  return rule?.branch ?? null
}

export function autoReplyLines(room: AutoReplyRoom, branch: AutoReplyBranch): string[] {
  return RULES[room].find((r) => r.branch === branch)?.replies ?? []
}

export const autoReplyId = (room: AutoReplyRoom, branch: AutoReplyBranch, index: number) => `auto-${room}-${branch}-${index + 1}`
