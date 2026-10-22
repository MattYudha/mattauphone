'use client'

import { useRef, useState } from 'react'
import { Bookmark, Camera, ChevronLeft, ChevronRight, Copy, Grid3x3, Heart, MessageCircle, MoreHorizontal, Plus, Send, X } from 'lucide-react'
import { HomeIndicator, StatusBar } from '@/components/phone/chrome'
import { useBackHandler } from '@/lib/story/back-nav'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'

const ME = { id: 'kimwp_', name: 'Kim Wonpil', avatar: '/images/instagram/image-1.jpg' }

type AccountId = 'wp' | 'yh'
type Account = {
  handle: string
  name: string
  avatar: string
  avatarPosition: string
  posts: number
  followers: string
  following: AccountId
}

const ACCOUNTS: Record<AccountId, Account> = {
  wp: { handle: ME.id, name: ME.name, avatar: ME.avatar, avatarPosition: '50% 32%', posts: 3, followers: '1,264', following: 'yh' },
  yh: {
    handle: 'Kangyounghyun',
    name: 'Kang Younghyun',
    avatar: '/images/instagram/kangyounghyun.jpg',
    avatarPosition: '50% 45%',
    posts: 0,
    followers: '1,173',
    following: 'wp',
  },
}

type View = { kind: 'profile'; account: AccountId } | { kind: 'following'; account: AccountId }

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
      { src: '/images/instagram/image-3.jpg', alt: 'Selfie memakai kemeja kotak-kotak sambil bersandar di sofa', ratio: 1206 / 1297 },
      { src: '/images/instagram/image-4.jpg', alt: 'Selfie close-up memakai kemeja kotak-kotak sambil tersenyum', ratio: 1186 / 1258 },
    ],
    caption: 'Bosennn',
    likedBy: 'Kangyounghyun',
    othersCount: 106,
    time: '2 hari yang lalu',
    comments: [
      { id: 'c1', user: 'sunny_day.92', text: 'Wonpil, lagi sibuk apa sekarang?', time: '2 hr' },
      { id: 'c2', user: 'jjun_hee', text: 'Masih ganteng aja ㅋㅋ', time: '2 hr' },
      { id: 'c3', user: 'mint_choco.ya', text: 'Diajak ketemu nggak mau, tapi bilangnya bosen', time: '1 hr' },
      { id: 'c4', user: 'dawn.0812', text: 'Makin lama makin ganteng sekaligus cantik', time: '1 hr' },
    ],
  },
  {
    id: 'p2',
    photos: [{ src: '/images/instagram/image-2.jpg', alt: 'Boneka monyet bermotif loreng memakai kemeja dan dasi', ratio: 1206 / 1307 }],

    caption: 'Hehe monyet rasa Kanadaㅎㅎ',
    likedBy: 'Kangyounghyun',
    othersCount: 153,
    time: '1 minggu yang lalu',
    comments: [
      {
        id: 'c5',
        user: 'hoon.daily',
        text: 'Siapa yg beliin?',
        time: '1 mgg',
        replies: [{ id: 'c5r', user: ME.id, text: 'Rahasia dong', time: '1 mgg' }],
      },
      { id: 'c6', user: 'seo_dodo', text: 'Oh tapi hyung lebih imut', time: '6 hr' },
      { id: 'c7', user: 'choi.minseo_', text: 'Oppa apa kabar? Muncul di rekomendasi jadi aku lihat, ternyata masih cakep kayak dulu ya ㅎㅎ', time: '5 hr' },
    ],
  },
  {
    id: 'p3',
    photos: [{ src: '/images/instagram/image-5.jpg', alt: 'Keyboard panggung merah di atas grand piano yang tutupnya terbuka', ratio: 1206 / 1163 }],
    caption: 'Hwaiting! Pasti bisa',
    likedBy: 'Kangyounghyun',
    othersCount: 243,
    time: '3 minggu yang lalu',
    comments: [],
  },
]

const countComments = (cs: Comment[]) => cs.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)

export function InstagramApp() {
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [commentsFor, setCommentsFor] = useState<string | null>(null)
  const [stack, setStack] = useState<View[]>([])
  const closeComments = () => setCommentsFor(null)
  useBackHandler(commentsFor !== null, closeComments)
  const popView = () => setStack((s) => s.slice(0, -1))
  useBackHandler(commentsFor === null && stack.length > 0, popView)
  const openPost = POSTS.find((p) => p.id === commentsFor)
  const view = stack[stack.length - 1]
  const pushView = (v: View) => setStack((s) => [...s, v])

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <StatusBar />
      {view ? (
        view.kind === 'profile' ? (
          <ProfileView
            account={view.account}
            canGoBack={stack.length > 1}
            onBack={popView}
            onOpenFollowing={() => pushView({ kind: 'following', account: view.account })}
            onOpenPost={(id) => {
              setStack([])
              setCommentsFor(null)
              requestAnimationFrame(() => document.getElementById(`ig-post-${id}`)?.scrollIntoView())
            }}
          />
        ) : (
          <FollowingView
            account={view.account}
            onBack={popView}
            onOpenAccount={(id) => pushView({ kind: 'profile', account: id })}
          />
        )
      ) : (
        <FeedView
          liked={liked}
          saved={saved}
          setLiked={setLiked}
          setSaved={setSaved}
          onOpenComments={setCommentsFor}
        />
      )}
      <nav aria-label="Tab Instagram" className="flex shrink-0 justify-around border-t border-black/10 bg-white py-2.5">
        <button type="button" onClick={() => setStack([])} aria-label="Beranda" aria-current={!view ? 'page' : undefined}>
          <HomeTabIcon filled={!view} />
        </button>
        <span className="size-6" aria-hidden />
        <span className="size-6" aria-hidden />
        <span className="size-6" aria-hidden />
        <button
          type="button"
          onClick={() => setStack([{ kind: 'profile', account: 'wp' }])}
          aria-label="Profil"
          aria-current={view ? 'page' : undefined}
          className={cn('rounded-full', view && 'ring-2 ring-black ring-offset-1')}
        >
          <Avatar className="size-6" />
        </button>
      </nav>
      <HomeIndicator className="bg-white" />
      {openPost && <CommentsSheet post={openPost} onClose={closeComments} />}
    </div>
  )
}

function FeedView({
  liked,
  saved,
  setLiked,
  setSaved,
  onOpenComments,
}: {
  liked: Record<string, boolean>
  saved: Record<string, boolean>
  setLiked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setSaved: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onOpenComments: (id: string) => void
}) {
  return (
    <>
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
        <section aria-label="Cerita" className="flex gap-4 border-b border-black/10 px-4 py-3">
          <div className="flex w-[72px] flex-col items-center gap-1">
            <span className="relative block size-[66px]">
              <Avatar className="size-full" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-[#0095f6]">
                <Plus className="size-3.5 text-white" strokeWidth={3} aria-hidden />
              </span>
            </span>
            <span className="text-[12px] text-black/70">Cerita Anda</span>
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
            onOpenComments={() => onOpenComments(p.id)}
          />
        ))}
        <p className="py-8 text-center text-[13px] text-black/40">Anda sudah melihat semuanya</p>
      </div>
    </>
  )
}

function ProfileView({
  account: accountId,
  canGoBack,
  onBack,
  onOpenFollowing,
  onOpenPost,
}: {
  account: AccountId
  canGoBack: boolean
  onBack: () => void
  onOpenFollowing: () => void
  onOpenPost: (id: string) => void
}) {
  const account = ACCOUNTS[accountId]
  const posts = accountId === 'wp' ? POSTS : []
  const stats = [
    { label: 'Postingan', value: String(account.posts) },
    { label: 'Pengikut', value: account.followers },
  ]
  return (
    <>
      <header className="flex shrink-0 items-center gap-1 px-2 pb-2">
        {canGoBack ? (
          <button type="button" onClick={onBack} aria-label="Kembali" className="p-1">
            <ChevronLeft className="size-7" />
          </button>
        ) : (
          <span className="w-2" aria-hidden />
        )}
        <h1 className="flex-1 truncate text-[20px] font-bold">{account.handle}</h1>
        <MoreHorizontal className="mr-2 size-6" aria-hidden />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <section aria-label="Info profil" className="px-4 pt-1">
          <div className="flex items-center gap-6">
            <Avatar account={accountId} className="size-[84px]" />
            <div className="flex flex-1 justify-around text-center">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-[17px] font-semibold">{s.value}</span>
                  <span className="text-[13px]">{s.label}</span>
                </div>
              ))}
              <button type="button" onClick={onOpenFollowing} className="flex flex-col active:opacity-60">
                <span className="text-[17px] font-semibold">1</span>
                <span className="text-[13px]">Mengikuti</span>
              </button>
            </div>
          </div>
          <p className="mt-3 text-[14px] font-semibold">{account.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-1.5" aria-hidden>
            {(accountId === 'wp' ? ['Edit Profil', 'Bagikan Profil'] : ['Mengikuti', 'Kirim Pesan']).map((label) => (
              <span key={label} className="rounded-lg bg-[#efefef] py-1.5 text-center text-[14px] font-semibold">
                {label}
              </span>
            ))}
          </div>
        </section>
        <div className="mt-4 flex justify-center border-b border-black/10" aria-hidden>
          <span className="border-b border-black px-6 pb-2.5">
            <Grid3x3 className="size-6" />
          </span>
        </div>
        {posts.length > 0 ? (
          <ul className="grid grid-cols-3 gap-px">
            {posts.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onOpenPost(p.id)} className="relative block aspect-[3/4] w-full bg-black/5">
                  <img src={withBasePath(p.photos[0].src)} alt={p.photos[0].alt} className="size-full object-cover" />
                  {p.photos.length > 1 && <Copy className="absolute right-1.5 top-1.5 size-4 text-white drop-shadow" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-8 pt-14 text-center">
            <span className="flex size-16 items-center justify-center rounded-full border-2 border-black">
              <Camera className="size-8" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="mt-4 text-[20px] font-bold">Belum Ada Postingan</p>
          </div>
        )}
      </div>
    </>
  )
}

function FollowingView({
  account: accountId,
  onBack,
  onOpenAccount,
}: {
  account: AccountId
  onBack: () => void
  onOpenAccount: (id: AccountId) => void
}) {
  const account = ACCOUNTS[accountId]
  const target = ACCOUNTS[account.following]
  return (
    <>
      <header className="flex shrink-0 items-center px-2 pb-1">
        <button type="button" onClick={onBack} aria-label="Kembali" className="p-1">
          <ChevronLeft className="size-7" />
        </button>
        <h1 className="flex-1 truncate pr-9 text-center text-[16px] font-bold">{account.handle}</h1>
      </header>
      <div className="flex shrink-0 border-b border-black/10 text-[14px]" aria-hidden>
        <span className="flex-1 pb-2.5 text-center text-black/40">{`${account.followers} Pengikut`}</span>
        <span className="flex-1 border-b border-black pb-2.5 text-center font-semibold">1 Mengikuti</span>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <li>
          <button
            type="button"
            onClick={() => onOpenAccount(account.following)}
            className="flex w-full items-center gap-3 py-2 text-left active:opacity-60"
          >
            <Avatar account={account.following} className="size-12" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">{target.handle}</span>
              <span className="block truncate text-[14px] text-black/50">{target.name}</span>
            </span>
            <span className="rounded-lg bg-[#efefef] px-4 py-1.5 text-[14px] font-semibold" aria-hidden>
              Mengikuti
            </span>
          </button>
        </li>
      </ul>
    </>
  )
}

function Avatar({ className, account = 'wp' }: { className?: string; account?: AccountId }) {
  const a = ACCOUNTS[account]
  return (
    <img
      src={withBasePath(a.avatar)}
      alt=""
      className={cn('shrink-0 rounded-full object-cover', className)}
      style={{ objectPosition: a.avatarPosition }}
    />
  )
}

function HomeTabIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', filled ? 'fill-black' : 'fill-none stroke-black stroke-2')}>
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
    <article id={`ig-post-${post.id}`} aria-label={`Postingan ${ME.id}`} className="pb-4">
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
        <button type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? 'Batal suka' : 'Suka'}>
          <Heart fill={liked ? 'currentColor' : 'none'} className={cn('size-[26px]', liked && 'fill-[#ff3040] text-[#ff3040]')} />
        </button>
        <button type="button" onClick={onOpenComments} aria-label="Lihat komentar">
          <MessageCircle className="size-[26px] -scale-x-100" />
        </button>
        <Send className="size-[24px]" aria-hidden />
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Batal simpan' : 'Simpan'} className="ml-auto">
          <Bookmark fill={saved ? 'currentColor' : 'none'} className={cn('size-[26px]', saved && 'fill-black')} />
        </button>
      </div>
      <div className="space-y-1 px-3 pt-2 text-[14px] leading-snug">
        <p>
          Disukai oleh <span className="font-semibold">{post.likedBy}</span> dan{' '}
          <span className="font-semibold">{post.othersCount + (liked ? 1 : 0)} lainnya</span>
        </p>
        <p>
          <span className="mr-1.5 font-semibold">{ME.id}</span>
          {post.caption}
        </p>
        {total > 0 && (
          <button type="button" onClick={onOpenComments} className="block text-black/45">
            {`Lihat semua ${total} komentar`}
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
        aria-roledescription={multi ? 'Slide' : undefined}
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
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Foto berikutnya"
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
        aria-label="Komentar"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[78%] min-h-[50%] flex-col rounded-t-[16px] bg-white pb-6"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-black/10 py-3">
          <span className="absolute top-1.5 h-1 w-9 rounded-full bg-black/20" aria-hidden />
          <h2 className="pt-1 text-[16px] font-semibold">Komentar</h2>
          <button type="button" onClick={onClose} aria-label="Tutup komentar" className="absolute right-3 top-3 p-1">
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
        <p className="mt-1 text-[12px] font-medium text-black/40">Balas</p>
      </div>
    </div>
  )
}
