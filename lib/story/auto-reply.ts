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

export function matchBranch(room: AutoReplyRoom, text: string): AutoReplyBranch | null {
  const n = normalize(text)
  const rule = RULES[room].find((r) => r.phrases.some((p) => n.includes(normalize(p))))
  return rule?.branch ?? null
}

export function autoReplyLines(room: AutoReplyRoom, branch: AutoReplyBranch): string[] {
  return RULES[room].find((r) => r.branch === branch)?.replies ?? []
}

export const autoReplyId = (room: AutoReplyRoom, branch: AutoReplyBranch, index: number) => `auto-${room}-${branch}-${index + 1}`
