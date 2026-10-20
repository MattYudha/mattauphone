'use client'

import { useRef, useState } from 'react'
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, MoreHorizontal, Plus, Send, X } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'

const ME = { id: 'kimwp_', name: '김원필', avatar: '/images/instagram/image-1.jpg' }

type Comment = { id: string; user: string; text: string; time: string; replies?: Comment[] }
type Photo = { src: string; alt: string; ratio: number }
type Post = {
  id: string
  photos: Photo[]
  caption: string
  likedBy: string
  othersCount: number
  time: string
  comments: Comment[]
}

const POSTS: Post[] = [
  {
    id: 'p1',
    photos: [
      { src: '/images/instagram/image-3.jpg', alt: '체크 셔츠를 입고 소파에 기대 찍은 셀카', ratio: 1206 / 1297 },
      { src: '/images/instagram/image-4.jpg', alt: '체크 셔츠를 입고 미소 짓는 가까운 셀카', ratio: 1186 / 1258 },
    ],
    caption: '심심행',
    likedBy: 'Kangyounghyun',
    othersCount: 106,
    time: '2일 전',
    comments: [
      { id: 'c1', user: 'sunny_day.92', text: '원필아 뭐하고 지내?', time: '2일' },
      { id: 'c2', user: 'jjun_hee', text: '여전히 잘생겼다ㅋㅋ', time: '2일' },
      { id: 'c3', user: 'mint_choco.ya', text: '나랑 만나진 않으면서 심심하다고 하네', time: '1일' },
      { id: 'c4', user: 'dawn.0812', text: '점점 더 잘생쁨되네', time: '1일' },
    ],
  },
  {
    id: 'p2',
    photos: [{ src: '/images/instagram/image-2.jpg', alt: '셔츠와 넥타이를 입은 위장무늬 원숭이 인형', ratio: 1206 / 1307 }],

    caption: '헤헤 캐나다물 먹은 원숭이ㅎㅎ',
    likedBy: 'Kangyounghyun',
    othersCount: 153,
    time: '1주 전',
    comments: [
      {
        id: 'c5',
        user: 'hoon.daily',
        text: '누가사줌?',
        time: '1주',
        replies: [{ id: 'c5r', user: ME.id, text: '비밀이야', time: '1주' }],
      },
      { id: 'c6', user: 'seo_dodo', text: '오 근데 형이 더 귀여움', time: '6일' },
      { id: 'c7', user: 'choi.minseo_', text: '오빠 잘 지내요? 추천에 떠서 보는데 미모는 여전하시네요ㅎㅎ', time: '5일' },
    ],
  },
  {
    id: 'p3',
    photos: [{ src: '/images/instagram/image-5.jpg', alt: '뚜껑이 열린 그랜드 피아노 위에 놓인 빨간 스테이지 키보드', ratio: 1206 / 1163 }],
    caption: '화이팅! 잘할 수 있다',
    likedBy: 'Kangyounghyun',
    othersCount: 243,
    time: '3주 전',
    comments: [],
  },
]

const countComments = (cs: Comment[]) => cs.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)

export function InstagramApp() {
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const closeComments = () => setCommentsFor(null)
  useBackHandler(commentsFor !== null, closeComments)
  const openPost = POSTS.find((p) => p.id === commentsFor)

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <StatusBar />
      <header className="flex shrink-0 items-center justify-between px-4 pb-1">
        <h1
          className="text-[30px] leading-none"
          style={{ fontFamily: '"Snell Roundhand", "Brush Script MT", "Segoe Script", cursive' }}
        >
          Instagram
        </h1>
        <span className="flex items-center gap-5" aria-hidden>
          <Heart className="size-6" />
          <Send className="size-6" />
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <section aria-label="스토리" className="flex gap-4 border-b border-black/10 px-4 py-3">
          <div className="flex w-[72px] flex-col items-center gap-1">
            <span className="relative block size-[66px]">
              <Avatar className="size-full" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-[#0095f6]">
                <Plus className="size-3.5 text-white" strokeWidth={3} aria-hidden />
              </span>
            </span>
            <span className="text-[12px] text-black/70">내 스토리</span>
          </div>
        </section>
        {POSTS.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            liked={!!liked[p.id]}
            saved={!!saved[p.id]}
            onLike={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}
            onSave={() => setSaved((s) => ({ ...s, [p.id]: !s[p.id] }))}
            onOpenComments={() => setCommentsFor(p.id)}
          />
        ))}
        <p className="py-8 text-center text-[13px] text-black/40">모두 확인했습니다</p>
      </div>
      <nav aria-hidden className="flex shrink-0 justify-around border-t border-black/10 bg-white py-2.5">
        <HomeTabIcon />
        <span className="size-6" />
        <span className="size-6" />
        <span className="size-6" />
        <Avatar className="size-6" />
      </nav>
      <HomeIndicator className="bg-white" />
      {openPost && <CommentsSheet post={openPost} onClose={closeComments} />}
    </div>
  )
}

function Avatar({ className }: { className?: string }) {
  return (
    <img
      src={withBasePath(ME.avatar)}
      alt=""
      className={cn('shrink-0 rounded-full object-cover', className)}
      style={{ objectPosition: '50% 32%' }}
    />
  )
}

function HomeTabIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-black">
      <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z" />
    </svg>
  )
}

function PostCard({
  post,
  liked,
  saved,
  onLike,
  onSave,
  onOpenComments,
}: {
  post: Post
  liked: boolean
  saved: boolean
  onLike: () => void
  onSave: () => void
  onOpenComments: () => void
}) {
  const total = countComments(post.comments)
  const first = post.comments[0]
  return (
    <article aria-label={`${ME.id}의 게시물`} className="pb-4">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px]">
          <span className="block rounded-full bg-white p-[2px]">
            <Avatar className="size-8" />
          </span>
        </span>
        <span className="flex-1 text-[14px] font-semibold">{ME.id}</span>
        <MoreHorizontal className="size-5" aria-hidden />
      </div>
      <Carousel photos={post.photos} />
      <div className="flex items-center gap-4 px-3 pt-2.5">
        <button type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? '좋아요 취소' : '좋아요'}>
          <Heart className={cn('size-[26px]', liked && 'fill-[#ff3040] text-[#ff3040]')} />
        </button>
        <button type="button" onClick={onOpenComments} aria-label="댓글 보기">
          <MessageCircle className="size-[26px] -scale-x-100" />
        </button>
        <Send className="size-[24px]" aria-hidden />
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? '저장 취소' : '저장'} className="ml-auto">
          <Bookmark className={cn('size-[26px]', saved && 'fill-black')} />
        </button>
      </div>
      <div className="space-y-1 px-3 pt-2 text-[14px] leading-snug">
        <p>
          <span className="font-semibold">{post.likedBy}</span>님 외{' '}
          <span className="font-semibold">{post.othersCount + (liked ? 1 : 0)}개</span>
        </p>
        <p>
          <span className="mr-1.5 font-semibold">{ME.id}</span>
          {post.caption}
        </p>
        {total > 0 && (
          <button type="button" onClick={onOpenComments} className="block text-black/45">
            {`댓글 ${total}개 모두 보기`}
          </button>
        )}
        {first && post.id === 'p1' && (
          <p>
            <span className="mr-1.5 font-semibold">{first.user}</span>
            {first.text}
          </p>
        )}
        <p className="text-[12px] text-black/40">{post.time}</p>
      </div>
    </article>
  )
}

function Carousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const multi = photos.length > 1
  const go = (i: number) => {
    const el = trackRef.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-black"
        style={{ aspectRatio: String(photos[0].ratio) }}
        aria-roledescription={multi ? '슬라이드' : undefined}
      >
        {photos.map((ph, i) => (
          <img
            key={ph.src}
            src={withBasePath(ph.src)}
            alt={multi ? `${ph.alt} (${i + 1}/${photos.length})` : ph.alt}
            className="h-full w-full shrink-0 snap-start object-contain"
            draggable={false}
          />
        ))}
      </div>
      {multi && (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[12px] font-medium text-white" aria-live="polite">
            {`${index + 1}/${photos.length}`}
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="이전 사진"
              className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="다음 사진"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
          <div className="absolute -bottom-[22px] left-1/2 flex -translate-x-1/2 gap-1" aria-hidden>
            {photos.map((ph, i) => (
              <span key={ph.src} className={cn('size-1.5 rounded-full', i === index ? 'bg-[#0095f6]' : 'bg-black/20')} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CommentsSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="댓글"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[78%] min-h-[50%] flex-col rounded-t-[16px] bg-white pb-6"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-black/10 py-3">
          <span className="absolute top-1.5 h-1 w-9 rounded-full bg-black/20" aria-hidden />
          <h2 className="pt-1 text-[16px] font-semibold">댓글</h2>
          <button type="button" onClick={onClose} aria-label="댓글 닫기" className="absolute right-3 top-3 p-1">
            <X className="size-5" />
          </button>
        </div>
        <ul className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-4">
          <li className="flex gap-3 border-b border-black/5 pb-4">
            <Avatar className="size-8" />
            <p className="text-[14px] leading-snug">
              <span className="mr-1.5 font-semibold">{ME.id}</span>
              {post.caption}
              <span className="mt-1 block text-[12px] text-black/40">{post.time}</span>
            </p>
          </li>
          {post.comments.map((c) => (
            <li key={c.id}>
              <CommentRow comment={c} />
              {c.replies && (
                <ul className="mt-4 space-y-4 pl-11">
                  {c.replies.map((r) => (
                    <li key={r.id}>
                      <CommentRow comment={r} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CommentRow({ comment }: { comment: Comment }) {
  const mine = comment.user === ME.id
  return (
    <div className="flex gap-3">
      {mine ? (
        <Avatar className="size-8" />
      ) : (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efefef] text-[13px] font-semibold uppercase text-black/50"
          aria-hidden
        >
          {comment.user.replace(/[^a-z]/gi, '').slice(0, 1)}
        </span>
      )}
      <div className="min-w-0 flex-1 text-[14px] leading-snug">
        <p>
          <span className="mr-1.5 font-semibold">{comment.user}</span>
          <span className="text-[12px] text-black/40">{comment.time}</span>
        </p>
        <p className="mt-0.5 break-words">{comment.text}</p>
        <p className="mt-1 text-[12px] font-medium text-black/40">답글 달기</p>
      </div>
    </div>
  )
}
