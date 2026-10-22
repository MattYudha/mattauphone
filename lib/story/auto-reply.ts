import type { KakaoRoomId } from './kakao'

export type AutoReplyRoom = 'yh' | 'jy'
export type AutoReplyBranch = 'A' | 'B'
export type AutoReplyState = { branch: AutoReplyBranch; triggerId: string }

type Rule = { branch: AutoReplyBranch; phrases: string[]; replies: string[] }

/** Disusun per room menurut prioritas. Begitu satu aturan cocok, room terkunci di cabang itu. */
const RULES: Record<AutoReplyRoom, Rule[]> = {
  yh: [
    { branch: 'A', phrases: [
  "nggak",
  "enggak",
  "nggak kok",
  "nggak lah",
  "nggak dong",
  "nggak sih",
  "nggak tuh",
  "nggak hyung",
  "nggak kok hyung",
  "bukan",
  "bukan kok",
  "bukan lah",
  "bukan hyung",
  "aku nggak",
  "sumpah nggak",
  "beneran nggak",
  "ya nggak lah",
  "ya enggak lah",
  "jelas nggak",
  "nggak ketemu",
  "aku nggak ketemu",
  "nggak ketemu kok",
  "aku nggak ketemu kok",
  "aku nggak ketemu dia",
  "nggak ketemu sama dia",
  "sumpah nggak ketemu",
  "beneran nggak ketemu",
  "aku beneran nggak ketemu dia",
  "aku nggak ketemu Woo Junyoung",
  "aku nggak ketemu Junyoung",
  "nggak ketemu Junyoung",
  "belum ketemu",
  "aku belum ketemu dia",
  "nggak pernah ketemu",
  "aku nggak pernah ketemu dia",
  "belum pernah ketemu",
  "hari ini nggak ketemu",
  "hari ini aku nggak ketemu dia",
  "aku nggak lihat dia",
  "nggak lihat dia hari ini",
  "nggak ada janji sama dia",
  "aku nggak ada janji sama dia",
  "aku nggak makan bareng dia",
  "nggak makan bareng",
  "aku nggak sama dia",
  "aku nggak lagi sama dia",
  "aku nggak bareng dia",
  "aku sendirian",
  "aku sendiri kok",
  "aku di akademi",
  "aku masih di akademi",
  "aku lagi di akademi",
  "aku lagi ngajar",
  "aku lagi ada les",
  "aku di rumah",
  "aku udah di rumah",
  "apaan sih",
  "ngomong apa sih",
  "kamu ngomong apa sih",
  "hyung ngomong apa sih",
  "kok ngomong gitu",
  "ngaco",
  "ngawur",
  "jangan ngaco",
  "omong kosong",
  "jangan asal ngomong",
  "ngapain aku ketemu dia",
  "buat apa aku ketemu dia",
  "ngapain aku ketemu Junyoung",
  "nggak ada alasan aku ketemu dia",
  "nggak mungkin",
  "mana mungkin",
  "nggak mungkin lah",
  "bukan gitu",
  "bukan begitu",
  "hyung salah paham",
  "salah paham",
  "kamu salah paham",
  "jangan salah paham",
  "siapa yang bilang aku ketemu",
  "kata siapa aku ketemu dia",
  "aku cuma chat",
  "cuma chat doang",
  "cuma chat nggak ketemu",
  "cuma telponan",
  "cuma teleponan nggak ketemu",
  "dia ngajak ketemu tapi aku tolak",
  "janjinya batal",
  "batal ketemu",
  "nggak jadi ketemu",
  "aku nggak bakal ketemu dia",
  "aku nggak akan ketemu dia",
  "aku nggak mau ketemu dia",
  "nggak ada niat ketemu",
  "nggak ada rencana ketemu",
  "tenang aja aku nggak ketemu",
  "jangan khawatir aku nggak ketemu dia",
  "aku nggak akan ketemu dia lagi",
  "bukan Junyoung",
  "itu orang lain bukan Junyoung",
  "dia bukan siapa siapa"
], replies: ['Oke', 'Kalau gitu tunggu dulu di parkiran akademi'] },
    { branch: 'B', phrases: [
  "benar",
  "bener",
  "betul",
  "iya bener",
  "iya betul",
  "bener kok",
  "iya ketemu",
  "iya aku ketemu",
  "iya ketemu kok",
  "ketemu",
  "ketemu kok",
  "udah ketemu",
  "aku udah ketemu",
  "aku ketemu",
  "aku ketemu dia",
  "bener aku ketemu",
  "aku ketemu Junyoung",
  "aku ketemu Woo Junyoung",
  "aku ketemu Junyoung-ssi",
  "aku ketemu dia hari ini",
  "tadi ketemu",
  "barusan ketemu",
  "ketemu sebentar",
  "cuma ketemu sebentar",
  "cuma ketemu doang kok",
  "cuma ngobrol sebentar",
  "ngobrol sebentar",
  "terus kenapa",
  "iya terus",
  "iya terus kenapa",
  "iya ketemu terus kenapa",
  "ketemu terus masalahnya apa",
  "emang kenapa kalau ketemu",
  "emang nggak boleh ketemu",
  "kenapa nggak boleh",
  "aku sama dia",
  "aku lagi sama dia",
  "lagi sama dia",
  "aku lagi sama Junyoung",
  "aku bareng dia",
  "aku lagi bareng dia",
  "dia di sebelahku",
  "dia lagi di sini",
  "dia ada di sini",
  "makan bareng dia",
  "aku makan bareng dia",
  "aku makan malam sama dia",
  "tadi makan bareng",
  "cuma makan doang",
  "cuma makan malam kok",
  "ngopi bareng",
  "aku ngopi sama dia",
  "jujur aku ketemu",
  "jujur aja aku ketemu dia",
  "sebenarnya aku ketemu",
  "aku nggak mau bohong aku ketemu dia",
  "dia yang ngajak ketemu",
  "aku yang ngajak ketemu",
  "ada janji sama dia",
  "aku ada janji sama dia",
  "aku ada janji sama Junyoung",
  "nanti mau ketemu",
  "aku mau ketemu dia",
  "nanti aku ketemu dia",
  "bentar lagi ketemu",
  "abis ini ketemu",
  "kita janjian",
  "udah janjian",
  "nanti makan malam sama dia",
  "aku mau makan malam sama dia",
  "aku lagi jalan ketemu dia",
  "dia lagi jalan ke sini",
  "dia lagi jemput aku",
  "dia udah di parkiran",
  "aku lagi nungguin dia",
  "aku lagi nunggu dia",
  "aku yang nyuruh dia datang",
  "terserah aku mau ketemu siapa",
  "urusan aku mau ketemu siapa",
  "bukan urusan hyung",
  "hyung siapa ngelarang aku",
  "kenapa hyung ngelarang",
  "iya aku ketemu emang kenapa",
  "ketemu ya ketemu"
], replies: ['Kim Wonpil', 'Jangan ketemu bajingan itu', 'Aku udah bilang, aku lagi jalan ke sana'] },
  ],
  jy: [
    {
      branch: 'A',
      phrases: [
  "nggak mau",
  "aku nggak mau",
  "nggak suka",
  "aku nggak suka",
  "males",
  "aku males",
  "ogah",
  "nggak deh",
  "nggak usah",
  "nggak perlu",
  "nggak usah repot",
  "jangan datang",
  "jangan ke sini",
  "nggak usah datang",
  "nggak usah ke sini",
  "nggak usah jemput",
  "jangan jemput aku",
  "jangan tunggu aku",
  "nggak usah nunggu",
  "nggak usah nungguin aku",
  "pulang aja",
  "pulang sana",
  "kamu pulang aja",
  "mending kamu pulang",
  "pergi aja",
  "pergi sana",
  "balik aja",
  "duluan aja",
  "aku mau pulang",
  "aku pulang sendiri",
  "aku mau sendiri",
  "biarin aku sendiri",
  "tinggalin aku",
  "jangan ganggu aku",
  "jangan ganggu",
  "jangan hubungi aku lagi",
  "jangan chat aku lagi",
  "jangan telepon aku",
  "jangan nelpon aku",
  "berhenti hubungi aku",
  "aku blokir ya",
  "aku blokir kamu",
  "aku nggak mau ketemu",
  "aku nggak mau ketemu kamu",
  "nggak mau ketemu kamu",
  "aku nggak mau ketemu lagi",
  "nggak usah ketemu lagi",
  "jangan ketemu lagi",
  "kita jangan ketemu lagi",
  "kita udahan aja",
  "udahan aja",
  "cukup sampai sini",
  "sampai sini aja",
  "aku nggak nyaman",
  "nggak nyaman",
  "risih",
  "aku risih",
  "bikin risih",
  "berhenti",
  "udah cukup",
  "cukup",
  "stop",
  "jangan begini",
  "jangan kayak gini",
  "jangan gini",
  "jangan lewat batas",
  "jangan salah paham",
  "aku nggak ada perasaan sama kamu",
  "aku nggak suka kamu",
  "aku nggak tertarik",
  "nggak tertarik",
  "jangan berharap",
  "makan malamnya batal",
  "batalin aja",
  "aku batalin janjinya",
  "aku nggak mau makan bareng",
  "nggak mau makan malam bareng",
  "lagi bete",
  "aku lagi bete",
  "aku lagi nggak mood",
  "nggak mood",
  "nggak seru",
  "aku nggak senang",
  "nggak senang",
  "nggak enak",
  "bukan karena kamu",
  "nggak ada hubungannya sama kamu",
  "ngapain ke sini",
  "ngapain kamu ke sini",
  "siapa suruh datang",
  "aku nggak minta kamu datang",
  "jangan cari aku",
  "nggak usah cari aku",
  "nggak ada yang perlu diomongin",
  "aku nggak mau ngomong",
  "aku nggak bakal bales",
  "jangan maksa",
  "jangan bercanda",
  "nggak lucu",
  "jangan sok akrab",
  "kamu siapa",
  "nggak sudi",
  "benci",
  "aku benci kamu",
  "diam",
  "tutup mulut",
  "berisik",
  "enyah",
  "mampus"
],
      replies: ['Hah?', 'Wonpil-ssi kenapa tiba-tiba begitu?'],
    },
    {
      branch: 'B',
      phrases: [
  "oke",
  "oke deh",
  "oke ditunggu",
  "boleh",
  "boleh banget",
  "mau",
  "aku mau",
  "mau dong",
  "suka",
  "aku suka",
  "senang",
  "aku senang",
  "senang banget",
  "asik",
  "asyik",
  "yuk",
  "ayo",
  "ayok",
  "sip",
  "siap",
  "mantap",
  "iya ayo",
  "iya boleh",
  "iya oke",
  "cepetan datang",
  "cepet ke sini",
  "buruan",
  "buruan datang",
  "sini aja",
  "ke sini aja",
  "datang aja",
  "datang ke akademi",
  "jemput aku",
  "jemput aku ya",
  "tolong jemput",
  "tunggu ya",
  "tunggu sebentar",
  "tunggu bentar ya",
  "aku ke sana",
  "aku ke sana sekarang",
  "aku turun",
  "aku turun sekarang",
  "aku keluar sekarang",
  "aku segera ke sana",
  "bentar lagi aku keluar",
  "aku udah selesai les",
  "les udah selesai",
  "aku tunggu",
  "aku tungguin",
  "hati hati di jalan",
  "makasih udah datang",
  "makasih udah jemput",
  "makasih",
  "terima kasih",
  "kangen",
  "aku kangen",
  "kangen kamu",
  "aku kangen kamu",
  "pengen ketemu",
  "aku mau ketemu",
  "mau ketemu kamu",
  "ayo ketemu",
  "ketemu nanti ya",
  "sampai ketemu",
  "nanti ketemu",
  "ayo makan malam",
  "makan malam bareng yuk",
  "ayo makan",
  "mau makan apa",
  "makan yang enak yuk",
  "makan malam tadi enak",
  "makasih makan malamnya",
  "senang makan bareng kamu",
  "lain kali makan bareng lagi",
  "lain kali ketemu lagi",
  "besok ketemu lagi",
  "lain kali aku yang traktir",
  "aku traktir",
  "iya aku lagi senang",
  "lagi senang",
  "mood aku bagus",
  "kelihatan ya",
  "ketahuan ya",
  "kok tahu",
  "mungkin",
  "kayaknya iya",
  "gara gara kamu",
  "berkat kamu",
  "karena kamu",
  "seru hari ini",
  "hari ini seru",
  "aku juga senang",
  "pengen bareng terus",
  "mau bareng lebih lama",
  "jangan pergi",
  "jangan pulang dulu",
  "temenin aku",
  "aku suka kamu",
  "suka sama kamu",
  "nyaman sama kamu",
  "aku nggak mau kamu pergi",
  "chat lagi ya",
  "kabari ya",
  "kabari kalau udah sampai",
  "nggak apa apa",
  "gapapa",
  "nggak keberatan",
  "aku nggak keberatan",
  "nggak masalah",
  "nggak benci",
  "aku nggak benci kamu"
],
      replies: ['Wonpil-ssi kayaknya lagi senang ya hari ini ㅎㅎ', 'Gara-gara makan malam sama aku?'],
    },
  ],
}

/** Ragam ejaan & slang yang setara dipetakan ke satu bentuk kanonik per kata. */
const WORD_GROUPS: [string, string[]][] = [
  ['tidak', ['nggak', 'ngga', 'enggak', 'engga', 'gak', 'ga', 'gk', 'ngk', 'nggk', 'tdk', 'tak', 'ndak', 'nda', 'kagak', 'kaga', 'kgk', 'g']],
  ['tidakapaapa', ['gapapa', 'gpp', 'gapap', 'ngapapa', 'nggapapa', 'gakpapa', 'gakapa']],
  ['sudah', ['udah', 'udh', 'dah', 'sdh', 'uda']],
  ['belum', ['blm', 'belom', 'blom']],
  ['aku', ['gue', 'gw', 'gua', 'saya', 'aq', 'ak', 'sy']],
  ['kamu', ['lo', 'lu', 'elo', 'elu', 'km', 'kau', 'anda']],
  ['dia', ['doi']],
  ['ketemu', ['ketemuan', 'bertemu', 'jumpa', 'ktm', 'ktmu']],
  ['sama', ['ama', 'sm', 'bareng', 'dengan', 'dgn', 'dg', 'bersama']],
  ['aja', ['saja', 'ae']],
  ['kalau', ['kalo', 'klo', 'kl', 'klau']],
  ['mau', ['mo', 'pengen', 'pingin', 'pengin', 'ingin', 'pgn']],
  ['lagi', ['lg']],
  ['banget', ['bgt', 'bngt']],
  ['yang', ['yg']],
  ['juga', ['jg']],
  ['gimana', ['gmn', 'bagaimana']],
  ['kenapa', ['knp', 'napa', 'mengapa']],
  ['nanti', ['ntar', 'nnti', 'entar', 'tar', 'ntr']],
  ['sekarang', ['skrg', 'skrng', 'skg']],
  ['benar', ['bener', 'betul', 'bnr', 'beneran', 'bneran']],
  ['iya', ['ya', 'iy', 'y', 'yap', 'yup', 'yoi', 'yes']],
  ['makan', ['mam', 'maem', 'mamam']],
  ['malam', ['malem']],
  ['terus', ['trus', 'trs']],
  ['tapi', ['tp', 'tpi']],
  ['emang', ['memang', 'emg']],
  ['datang', ['dateng', 'dtg']],
  ['jangan', ['jgn', 'jngn']],
  ['makasih', ['makasi', 'mksh', 'thanks', 'thx', 'tengkyu']],
  ['senang', ['seneng']],
  ['sebentar', ['bentar', 'bntr']],
  ['telepon', ['telpon', 'nelpon', 'nelepon', 'telfon']],
  ['lihat', ['liat']],
  ['ngomong', ['ngomongin', 'omong']],
  ['tahu', ['tau']],
  ['oke', ['ok', 'okay', 'okey', 'okee', 'okeh', 'okk']],
]

/** Huruf yang berulang (nggaaak, iyaaa) diringkas agar ejaan panjang tetap cocok. */
const collapse = (w: string) => w.replace(/(\p{L})\1+/gu, '$1')

const WORD_MAP = new Map<string, string>()
for (const [canonical, variants] of WORD_GROUPS) {
  for (const v of [canonical, ...variants]) WORD_MAP.set(collapse(v), canonical)
}

/** Tawa/tangis di akhir kalimat (wkwk, haha, ㅋㅋ, ㅠㅠ) diabaikan. */
const LAUGH_TAIL = /(?:(?:wk|kw)+w?|(?:ha){2,}h?|(?:he){2,}h?|(?:hi){2,}h?|(?:hu){2,}h?|(?:xi){2,}|[ㅋㅎㅠㅜ]+)+$/u

function tokens(s: string): string[] {
  return s
    .normalize('NFC')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => {
      const c = collapse(w)
      return WORD_MAP.get(c) ?? c
    })
}

/** Spasi, tanda baca, dan simbol dihapus, lalu dibandingkan hanya berdasarkan isi ungkapan. */
const normalize = (s: string) => tokens(s).join('').replace(LAUGH_TAIL, '')

export function isAutoReplyRoom(id: KakaoRoomId): id is AutoReplyRoom {
  return id === 'yh' || id === 'jy'
}

/** Kata kasar pendek dicocokkan per kata utuh (supaya "masuk", "sampai", "cocok" tidak ikut terdeteksi). */
const PROFANITY_WORDS = new Set([
  'asu', 'tai', 'taik', 'tahi', 'cok', 'jancok', 'jancuk', 'babi', 'bego', 'goblok', 'goblog', 'gblk', 'tolol', 'tll',
  'bodoh', 'idiot', 'dungu', 'sial', 'sialan', 'setan', 'bangsat', 'bgst', 'bajingan', 'brengsek', 'keparat', 'kampret',
  'monyet', 'anjing', 'anjg', 'anj', 'anjir', 'anjrit', 'njir', 'njing', 'kontol', 'kntl', 'memek', 'ngentot', 'ngentod',
  'entot', 'pukimak', 'kimak', 'pantek', 'bacot', 'bct', 'fuck', 'fck', 'shit', 'bitch', 'bastard', 'asshole',
].map(collapse))

/** Kata kasar panjang yang cukup khas untuk dicari di mana saja, termasuk saat ditulis menyambung. */
const PROFANITY_PARTS = ['anjing', 'bangsat', 'bajingan', 'brengsek', 'keparat', 'kampret', 'kontol', 'memek', 'ngentot',
  'ngentod', 'goblok', 'goblog', 'pukimak', 'bacot', 'fuck', 'bitch', 'asshole'].map(collapse)

function hasProfanity(text: string): boolean {
  const words = tokens(text)
  if (words.some((w) => PROFANITY_WORDS.has(w))) return true
  const joined = words.join('')
  return PROFANITY_PARTS.some((p) => joined.includes(p))
}

// Pernyataan campuran yang eksplisit mengalahkan pencocokan frasa biasa; konflik lain dibiarkan tanpa balasan.
const EXCEPTIONS: Record<AutoReplyRoom, { branch: AutoReplyBranch; text: string }[]> = {
  yh: [
    ...['belum ketemu tapi nanti mau ketemu', 'belum ketemu, nanti baru ketemu', 'hari ini nggak ketemu, besok baru ketemu',
      'tadinya nggak mau ketemu tapi akhirnya jadi ketemu', 'udah ketemu tapi nggak bakal ketemu lagi']
      .map(text => ({ branch: 'B' as const, text })),
  ],
  jy: [
    { branch: 'A', text: 'oke cukup, jangan datang' },
    { branch: 'B', text: 'hari ini nggak bisa ketemu, besok aja ya' },
  ],
}
const AMBIGUOUS = ['iya', 'he em', 'hmm', 'oh', 'hah', 'apa', 'apaan', 'kenapa', 'emang kenapa', 'maksudnya', 'tiba tiba',
  'siapa yang bilang', 'kata siapa', 'kenapa emang', 'hari ini aku nggak bisa ketemu', 'aku lagi sibuk', 'lagi sibuk', 'sibuk']
  .map(normalize)
/** Ungkapan satu-dua kata yang hanya dihitung bila berdiri sendiri, bukan sebagai potongan kalimat lain. */
const SHORT = new Set(['nggak', 'aku nggak', 'bukan', 'benar', 'ketemu', 'oke', 'boleh', 'mau', 'aku mau', 'suka', 'aku suka',
  'senang', 'yuk', 'ayo', 'sip', 'siap', 'kangen', 'mungkin', 'makasih', 'diam', 'stop', 'cukup', 'males', 'ogah', 'berhenti',
  'risih', 'benci', 'sama dia'].map(normalize))

/** Kalimat yang mengutip atau berandai-andai tidak dianggap sebagai jawaban sungguhan. */
const HYPOTHETICAL = /seandainya|andaikan|andaikata|misalnya|semisal|umpamanya|kalaubilang|kalauakubilang|gimanakalau/u
const NEGATION_TAIL = /(?:tidak|belum|bukan|jangan|tanpa|ogah|males)(?:jadi|pernah|bisa|mau|akan|bakal|sempat)?$/u

export function matchBranch(room: AutoReplyRoom, text: string): AutoReplyBranch | null {
  const n = normalize(text)
  if (!n) return null
  if (room === 'jy' && hasProfanity(text)) return 'A'
  if (AMBIGUOUS.includes(n)) return null
  // Jangan menafsirkan contoh yang dikutip atau pernyataan andai-andai sebagai maksud pengguna.
  if (/["“”'‘’「」『』]/u.test(text) || HYPOTHETICAL.test(n)) return null
  const exception = EXCEPTIONS[room].find(rule => normalize(rule.text) === n)
  if (exception) return exception.branch

  const rules = RULES[room].flatMap(rule => rule.phrases.map(text => ({
    branch: rule.branch, phrase: normalize(text),
  })))
  const exact = rules.find(rule => rule.phrase === n)
  if (exact) return exact.branch

  // Utamakan frasa yang lebih panjang. Kecocokan bersarang seperti "ketemu" di dalam "tidakketemu" diabaikan.
  const matches: { branch: AutoReplyBranch; start: number; end: number }[] = []
  for (const rule of rules) {
    if (SHORT.has(rule.phrase)) continue
    let start = n.indexOf(rule.phrase)
    while (start !== -1) {
      matches.push({ branch: rule.branch, start, end: start + rule.phrase.length })
      start = n.indexOf(rule.phrase, start + 1)
    }
  }
  const specific = matches.filter(m => !matches.some(other =>
    other.start <= m.start && other.end >= m.end && other.end - other.start > m.end - m.start))
  // Penyangkalan yang tidak terdaftar di depan potongan positif tidak boleh berubah menjadi jawaban setuju.
  const usable = specific.filter(m => m.branch !== 'B' || !NEGATION_TAIL.test(n.slice(0, m.start)))
  const branches = new Set(usable.map(m => m.branch))
  if (branches.size !== 1) return null
  return usable[0].branch
}

export function autoReplyLines(room: AutoReplyRoom, branch: AutoReplyBranch): string[] {
  return RULES[room].find((r) => r.branch === branch)?.replies ?? []
}

export const autoReplyId = (room: AutoReplyRoom, branch: AutoReplyBranch, index: number) => `auto-${room}-${branch}-${index + 1}`
