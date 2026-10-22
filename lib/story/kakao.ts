import type { ContactId } from './contacts'
import { kst } from './time'

export type KakaoReply = { to: string; text: string }

export type KakaoCard = {
  title: string
  body: string
  button: string
  footer?: string
}

export type KakaoContent =
  | { type: 'text'; text: string; reply?: KakaoReply }
  | { type: 'sticker'; sticker: 'pout' | 'teary' }
  | { type: 'location'; title: string }
  | { type: 'card'; card: KakaoCard }

export type KakaoRoomId = 'yh' | 'hs' | 'jy' | 'wa' | 'unknown' | 'pres' | 'kakaopay' | 'supreme'

export type KakaoMessage = {
  id: string
  roomId: KakaoRoomId
  from: 'me' | 'them'
  at: string
  /** Urutan tiba pesan pada waktu yang sama. Riwayat bawaan 0, event cerita mulai dari 1. */
  seq: number
  content: KakaoContent
}

export type KakaoRoom = {
  id: KakaoRoomId
  contactId: ContactId
  messages: KakaoMessage[]
  /** Jumlah pesan terakhir yang ditandai belum dibaca sampai ruang chat pertama kali dibuka */
  initialUnread?: number
}

type Entry = [
  string,
  'me' | 'them',
  | string
  | { sticker: 'pout' | 'teary' }
  | { location: string }
  | { text: string; reply: KakaoReply }
  | { card: KakaoCard },
]

function toContent(c: Entry[2]): KakaoContent {
  if (typeof c === 'string') return { type: 'text', text: c }
  if ('sticker' in c) return { type: 'sticker', sticker: c.sticker }
  if ('location' in c) return { type: 'location', title: c.location }
  if ('card' in c) return { type: 'card', card: c.card }
  return { type: 'text', text: c.text, reply: c.reply }
}

function room(id: KakaoRoomId, contactId: ContactId, entries: Entry[], initialUnread?: number): KakaoRoom {
  return {
    id,
    contactId,
    initialUnread,
    messages: entries.map(([at, from, c], i) => ({
      id: `${id}-${i}`,
      roomId: id,
      from,
      at: kst(at),
      seq: 0,
      content: toContent(c),
    })),
  }
}

const ME = 'me' as const
const T = 'them' as const

export const kakaoRooms: KakaoRoom[] = [
  room('yh', 'yh', [
    ['2025-11-02 18:02', ME, 'Hyung!!'],
    ['2025-11-02 18:02', ME, 'Udah nyampe Kolea???'],
    ['2025-11-02 21:03', T, 'Udah sampai Seoul'],
    ['2025-11-02 21:03', T, 'Pulang dulu, abis itu ke sana'],
    ['2025-11-02 21:04', T, 'Kirim alamat akademi'],
    ['2025-11-02 21:04', ME, { location: 'Youngwon Piano · Lokasi fiktif' }],
    ['2025-11-02 21:05', ME, 'Ini!! Ati-ati di jalan ya hyungㅎㅎ'],
    ['2025-11-02 21:05', T, 'Ya'],

    ['2025-11-04 12:10', ME, 'Hyung udah maemm?'],
    ['2025-11-04 12:11', T, 'Belum'],
    ['2025-11-04 12:11', ME, 'Cepetan maemm sanaㅡㅡ'],
    ['2025-11-04 12:12', ME, 'Jetlagnya udah ilang??'],
    ['2025-11-04 12:13', T, 'Lumayan'],
    ['2025-11-04 12:13', T, 'Kamu juga makan'],

    ['2025-11-05 17:40', ME, 'Tadi aku dikasih pelmen sama bocil dongg ㅎㅎ'],
    ['2025-11-05 17:40', ME, 'Katanya disimpen buat seonsaengnim abis les selesaii'],
    ['2025-11-05 17:41', ME, 'Lucu banget kan??'],
    ['2025-11-05 17:42', T, 'Bocil emang lucu'],
    ['2025-11-05 17:43', ME, 'Kalo aku?'],
    ['2025-11-05 17:44', T, 'Kamu juga bocil sih'],
    ['2025-11-05 17:44', ME, { text: 'ㅎㅎㅎㅎ', reply: { to: 'Younghyun hyung❤️', text: 'Kamu juga bocil sih' } }],

    ['2025-11-07 22:15', ME, 'Hyung udah bobo?'],
    ['2025-11-07 22:16', T, 'Belum'],
    ['2025-11-07 22:16', ME, 'Hari ini aku ngajar les enam kali dong ㅠㅠ'],
    ['2025-11-07 22:16', ME, 'Jariku sakitt'],
    ['2025-11-07 22:17', ME, 'Hyung dengerin aku kan ㅡㅡ'],
    ['2025-11-07 22:18', T, 'Kerjaan numpuk, lagi nggak fokus'],
    ['2025-11-07 22:18', T, 'Nggak perlu ke dokter?'],
    ['2025-11-07 22:18', T, 'Minta resep obat kek'],

    ['2025-11-08 13:05', ME, 'Hyung kan weekend, lagi ngapain??'],
    ['2025-11-08 13:06', T, 'Rumah'],
    ['2025-11-08 13:06', ME, 'Partitur dari tukang jilid udah dateng, besok harus kuberesin ㅠ'],
    ['2025-11-08 13:07', ME, 'Siapa yang mau bantuin~~'],
    ['2025-11-08 13:08', T, 'Kerjain sendiri lah, kan kamu kepala akademi'],
    ['2025-11-08 13:08', ME, 'Pelit ihh ㅠㅠ'],

    ['2025-11-09 19:20', ME, 'Hyung udah maemm malem?'],
    ['2025-11-09 19:22', T, 'Udah, makan pho'],
    ['2025-11-09 19:22', T, 'Kamu?'],
    ['2025-11-09 19:22', ME, 'Kayaknya aku begadang malem ini...ㅠ yang mau dijilid banyak bangett'],
    ['2025-11-09 19:23', T, 'Jangan maksain, istirahat'],

    ['2025-11-10 16:02', ME, 'Hyung aku baru bangun'],
    ['2025-11-10 16:02', ME, 'Semalem jilid partitur sampe bobo telat bangett ㅠㅠ'],
    ['2025-11-10 16:03', ME, 'Kayak pingsan beneran'],
    ['2025-11-10 16:04', T, 'Lama juga tidurnya'],
    ['2025-11-10 16:04', T, 'Cepet makan'],
    ['2025-11-10 16:05', ME, 'Hyung di mana? Lagi ngapain?'],
    ['2025-11-10 16:05', ME, 'Temenin aku main dongg ㅠㅠ'],
    ['2025-11-10 16:05', ME, 'Atau mau maem baleng aku?'],
    ['2025-11-10 16:06', ME, { sticker: 'pout' }],
    ['2025-11-10 16:06', ME, { sticker: 'teary' }],
    ['2025-11-10 16:07', T, 'Hari ini aku abis dari nikahan temen sekolah'],
    ['2025-11-10 16:07', T, 'Sekarang lagi sama Kim Wona'],
    ['2025-11-10 16:08', ME, 'Kim Wona?'],
    ['2025-11-10 16:08', ME, 'Lagi sama Kim Wona?'],
    ['2025-11-10 16:08', ME, 'Kenapa hyung sama Kim Wona?'],
    ['2025-11-10 16:08', ME, 'Berdua? Sekarang?'],
    [
      '2025-11-10 21:32',
      ME,
      'Hyung maaf, aku tiba-tiba ada urusan, kayaknya harus pergi\n\nKamu lagi mandi jadi aku tinggalin pesan aja',
    ],

    ['2025-11-14 12:30', T, 'Udah makan siang?'],
    ['2025-11-14 13:52', ME, 'Udah'],
    ['2025-11-14 13:53', T, 'Makan apa'],
    ['2025-11-14 14:40', ME, 'Ya makan aja'],

    ['2025-11-15 11:10', T, 'Udah bangun?'],
    ['2025-11-15 13:25', ME, 'Udah'],
    ['2025-11-15 13:26', T, 'Hari ini ke akademi?'],
    ['2025-11-15 14:02', ME, 'Iya, ada les pengganti'],
    ['2025-11-15 14:03', T, 'Dingin, pake baju yang tebel'],

    ['2025-11-17 15:20', T, 'Ada yang pengen kamu makan?'],
    ['2025-11-17 15:20', T, 'Nanti kubeliin pas ke akademi'],
    ['2025-11-17 17:05', ME, 'Gapapa'],
    ['2025-11-17 17:05', ME, 'Nggak usah dateng'],
    ['2025-11-17 17:06', T, 'Aku tetep dateng'],

    ['2025-11-18 18:40', T, 'Hari ini selesai jam berapa'],
    ['2025-11-18 19:50', ME, 'Kenapa'],
    ['2025-11-18 19:51', T, 'Makan bareng'],
    ['2025-11-18 20:33', ME, 'Aku ada janji'],
    ['2025-11-18 20:34', T, 'Oke'],

    ['2025-11-19 12:15', T, 'Jangan lupa makan'],
    ['2025-11-19 13:40', ME, 'Hm'],
  ]),

  room('hs', 'hs', [
    ['2025-10-14 12:31', ME, 'Sayang lagi ngapainn'],
    ['2025-10-14 12:33', T, 'Mikirin kamuㅎ'],
    ['2025-10-14 12:33', T, 'Kalo sayang?'],
    ['2025-10-14 12:40', ME, 'Lagi istirahat bentar di sela les~'],
    ['2025-10-14 21:12', ME, 'ㅋㅋㅋ aku baru kelar di akademii'],
    ['2025-10-14 21:13', T, 'Capek yaa, mau makan?'],
    ['2025-10-14 21:13', ME, 'Mau mau lapell'],
    ['2025-10-14 21:14', ME, 'Waktu Younghyun hyung masih di Kanada, katanya tempat ini enak lohh'],
    ['2025-10-14 21:14', ME, 'Kedai pho baru di depan akademi!'],
    ['2025-10-14 21:16', T, 'Oh gitu?ㅎㅎ'],
    ['2025-10-14 21:16', T, 'Terus sayang pengennya makan apa'],
    ['2025-10-14 21:17', ME, 'Hmm.. yaudah pho aja!'],
    ['2025-10-14 21:17', T, 'Oke, aku jemput'],

    ['2025-10-20 09:02', T, 'Sayang udah bangun?'],
    ['2025-10-20 09:30', ME, 'Umm.. balusan banguun'],
    ['2025-10-20 09:31', T, 'Udah maem belomm?'],
    ['2025-10-20 09:35', ME, 'Belum ㅠ'],
    ['2025-10-20 09:35', ME, 'Younghyun hyung kirim foto Kanada, katanya di sana udah turun salju'],
    ['2025-10-20 09:36', ME, 'Keren kan'],
    ['2025-10-20 09:40', T, 'Oh udah?ㅎㅎ'],
    ['2025-10-20 09:40', T, 'Di sini masih anget padahal'],
    ['2025-10-20 09:41', T, 'Sayang hari ini kelar jam berapa?'],
    ['2025-10-20 09:42', ME, 'Jam 8!'],
    ['2025-10-20 09:42', T, 'Yaudah abis kelar aku telepon'],

    ['2025-10-26 14:10', ME, 'Sayaang hari ini ngapain'],
    ['2025-10-26 14:12', T, 'Di rumah~ guling-guling'],
    ['2025-10-26 14:12', T, 'Kangen sayangg'],
    ['2025-10-26 14:15', ME, 'Akuu jugaa'],
    ['2025-10-26 14:16', ME, 'Eh btw Younghyun hyung bulan depan balik ke Korea!!'],
    ['2025-10-26 14:16', ME, 'Udah lama banget nggak ketemu'],
    ['2025-10-26 14:20', T, 'Oh gituㅎ'],
    ['2025-10-26 14:21', T, 'Nanti malem kita nonton yuk?'],
    ['2025-10-26 14:22', ME, 'Ayo, nonton apa'],
    ['2025-10-26 14:23', T, 'Aku cariin'],

    ['2025-10-30 22:40', T, 'Sayang lagi ngapainn'],
    ['2025-10-30 22:41', ME, 'Lagi beresin partitur ㅠㅠ'],
    ['2025-10-30 22:41', ME, 'Lagi milih lagu buat resital anak-anak'],
    ['2025-10-30 22:42', T, 'Kasian capek yaa'],
    ['2025-10-30 22:43', ME, 'Younghyun hyung kalo liat beginian pasti nyuruh kerjain asal aja ㅋㅋ'],
    ['2025-10-30 22:46', T, 'ㅎㅎ'],
    ['2025-10-30 22:46', T, 'Mending pikirin weekend mau makan apa'],
    ['2025-10-30 22:47', ME, 'Umm okee'],

    ['2025-11-02 11:20', T, 'Sayang udah banguun?'],
    ['2025-11-02 11:24', ME, 'Umm udah banguun'],
    ['2025-11-02 11:25', T, 'Udah maem belomm?'],
    ['2025-11-02 11:30', ME, 'Baru mau maemm'],
    ['2025-11-02 16:20', ME, 'Younghyun hyung bentar lagi nyampe Korea lohh ㅎㅎ'],
    ['2025-11-02 16:31', T, 'Oh hari ini ya'],
    ['2025-11-02 16:32', T, 'Sayang hari ini di akademi sampe malem?'],
    ['2025-11-02 16:35', ME, 'Umm ada yang mau diberesin'],
    ['2025-11-02 16:36', T, 'Oke aku ke akademi sekarang'],

    ['2025-11-03 03:20', T, 'Kita putus aja'],
    ['2025-11-03 03:21', ME, 'Tiba-tiba ngomong apa sih'],
    ['2025-11-03 03:21', ME, 'Sayang ngambek lagi?'],
    ['2025-11-03 03:23', T, 'Udah nggak sanggup aja'],
    ['2025-11-03 03:23', T, 'Sama semua drama ini'],
    ['2025-11-03 03:24', ME, 'Kenapa sih'],
    ['2025-11-03 03:24', ME, 'Telepon aku, kita omongin'],
    ['2025-11-03 03:26', T, 'Jangan telepon'],
    ['2025-11-03 03:27', ME, 'Kalo tiba-tiba gini aku harus gimana'],
    ['2025-11-03 03:27', ME, 'Kalo aku salah apa, bilang'],
    ['2025-11-03 03:30', T, 'Bangsat, muak aku. Nggak bisa lanjut lagi'],
    ['2025-11-03 04:10', ME, 'Oke, kita putus'],
  ]),

  room('jy', 'jy', [
    ['2025-09-02 20:14', T, 'Halo Wonpil-ssiㅎㅎ'],
    ['2025-09-02 20:14', T, 'Ini Woo Junyoung. Nggak tahu kamu masih ingat atau nggak'],
    ['2025-09-02 20:15', T, 'Aku dapat kontakmu waktu reuni alumni minggu lalu'],
    ['2025-09-03 10:42', ME, 'Ah iya, halo'],
    ['2025-09-03 10:43', ME, 'Aku ingat kok'],
    ['2025-09-03 10:50', T, 'Syukurlahㅎ'],
    ['2025-09-03 10:51', T, 'Aku masih ingat waktu Wonpil-ssi jadi pengiring piano di konser rutin klub dulu'],
    ['2025-09-03 14:20', ME, 'Itu udah lama banget ya'],

    ['2025-09-18 19:30', T, 'Wonpil-ssi akhir-akhir ini sibuk banget?'],
    ['2025-09-18 19:31', T, 'Kalau ada waktu, kita makan bareng yaㅎㅎ'],
    ['2025-09-18 23:48', ME, 'Akhir-akhir ini kerjaan di akademi lagi agak banyak'],
    ['2025-09-18 23:48', ME, 'Nanti kalau waktunya pas ya'],
    ['2025-09-18 23:52', T, 'Oke! Aku tunggu kabarnya'],

    ['2025-10-09 12:00', T, 'Hari ini Hari Hangeul, akademinya libur?'],
    ['2025-10-09 12:01', T, 'Cuacanya bagus banget ya'],
    ['2025-10-09 16:35', ME, 'Iya, hari ini libur'],
    ['2025-10-09 16:40', T, 'Istirahat yang cukup yaㅎ'],

    ['2025-10-28 21:10', T, 'Wonpil-ssi, ada restoran pasta baru di dekat akademi, tahu nggak?'],
    ['2025-10-29 09:15', ME, 'Nggak, aku nggak tahu'],
    ['2025-10-29 09:20', T, 'Lain kali kita coba ke sana bareng yaㅎㅎ'],
    ['2025-10-29 11:02', ME, 'Iya'],

    ['2025-11-12 18:20', T, 'Wonpil-ssi udah makan malam?'],
    ['2025-11-12 18:21', T, 'Akhir-akhir ini tiba-tiba dingin, hati-hati jangan sampai flu ya'],
    ['2025-11-13 08:55', ME, 'Iya, makasih'],

    ['2025-11-18 19:12', T, 'Besok jam 6 sore ada waktu?'],
    ['2025-11-18 19:13', T, 'Kita makan bareng ya'],
    ['2025-11-18 19:13', T, 'Kan waktu itu udah janjiㅎ'],
  ]),

  room('wa', 'wa', [
    ['2025-06-14 15:20', T, 'Sabtu depan ultah nenek, jam 6 sore'],
    ['2025-06-14 16:02', ME, 'Oke'],
    ['2025-06-14 16:03', T, 'Jangan telat'],

    ['2025-08-30 19:45', T, 'Telepon mama dong'],
    ['2025-08-30 19:45', T, 'Kayaknya dia sedih tuh'],
    ['2025-08-30 21:10', ME, 'Iya nanti aku telepon'],

    ['2025-10-01 13:05', T, 'Chuseok kapan pulang'],
    ['2025-10-01 14:30', ME, 'Tanggal 5 malem'],
    ['2025-10-01 14:31', T, 'ㅇㅋ nanti kubilangin ke mama'],

      ['2025-11-10 18:02', T, 'Btw kamu tadi nongol dari mana sih?'],
      ['2025-11-10 18:02', T, 'Nggak nyangka kamu masih kontakan sama Kang Younghyun'],
      ['2025-11-10 18:02', T, 'Sekarang masih sama Kang Younghyun?'],
      ['2025-11-10 18:03', T, 'Wah, soulmate banget ya kalian berdua'],
    ],
    4,
  ),

  room(
    'kakaopay',
    'kakaopay',
    [
      [
        '2025-11-03 11:00',
        T,
        {
          card: {
            title: '(Iklan) Benefit Pay Money November sudah tiba',
            body: 'Bayar pakai KakaoPay Money di minimarket·kafe,\nlangsung diskon hingga ₩3.000!\n\nPeriode promo: 3/11 (Sen) ~ 30/11 (Min)\n※ 1 kali per orang, berakhir lebih awal jika kuota habis',
            button: 'Ambil benefit',
            footer: 'Berhenti berlangganan: Beranda > Pengaturan > Pengaturan Notifikasi',
          },
        },
      ],
      [
        '2025-11-07 12:30',
        T,
        {
          card: {
            title: '(Iklan) Kuis Keberuntungan hari ini dibuka',
            body: 'Jawab kuisnya dan dapatkan poin!\nJawab benar, dapat hingga 1.000 poin\n\nKuis baru dibuka setiap hari pukul 12.30 siang.',
            button: 'Ikut kuis',
            footer: 'Berhenti berlangganan: Beranda > Pengaturan > Pengaturan Notifikasi',
          },
        },
      ],
      [
        '2025-11-12 18:00',
        T,
        {
          card: {
            title: '(Iklan) Sudah cek skor kreditmu?',
            body: 'Skor kredit Wonpil-nim sudah diperbarui.\nCek sekarang gratis\ndan dapatkan tips jitu menaikkan skor.\n\n※ Cek skor kredit tidak memengaruhi skormu.',
            button: 'Lihat skor kredit',
            footer: 'Berhenti berlangganan: Beranda > Pengaturan > Pengaturan Notifikasi',
          },
        },
      ],
      [
        '2025-11-17 10:00',
        T,
        {
          card: {
            title: '(Iklan) Black Friday cashback hingga 50%',
            body: 'Bayar pakai KakaoPay, cashback hingga 50% per brand!\nOlive Young, Musinsa, Baemin, dan brand populer lainnya\n\nPeriode promo: 17/11 (Sen) ~ 30/11 (Min)',
            button: 'Lihat brand cashback',
            footer: 'Berhenti berlangganan: Beranda > Pengaturan > Pengaturan Notifikasi',
          },
        },
      ],
    ],
    4,
  ),

  room(
    'supreme',
    'supreme',
    [
      [
        '2025-11-16 14:21',
        T,
        {
          card: {
            title: '[Supreme] Pemberitahuan persetujuan menerima informasi iklan',
            body: 'Halo, pelanggan Kim Wonpil.\nTerima kasih telah menambahkan channel KakaoTalk Supreme.\n\nPada 16 November 2025 Anda telah menyetujui untuk menerima informasi iklan dari Supreme (drop produk baru, event, promo diskon).\n\n■ Waktu persetujuan: 16.11.2025 14.21\n■ Channel: KakaoTalk\n■ Tindakan: Setuju menerima\n\nPemberitahuan ini dikirim sesuai Pasal 50 UU Jaringan Informasi dan Komunikasi Korea.',
            button: 'Ubah pengaturan langganan',
            footer: 'Berhenti berlangganan: blokir channel atau Ruang chat > Pengaturan > Tolak pesan iklan',
          },
        },
      ],
      [
        '2025-11-16 14:21',
        T,
        {
          card: {
            title: '(Iklan) Supreme Fall/Winter 2025',
            body: 'Drop Week 12 dirilis Kamis ini pukul 11.00.\nCek lookbook-nya sekarang juga.',
            button: 'Lihat lookbook',
            footer: 'Berhenti berlangganan: blokir channel',
          },
        },
      ],
    ],
    2,
  ),

  room('unknown', 'unknown', [
    ['2024-05-12 14:03', T, 'Wonpil-ssi, gimana kalau minggu ini kita ngopi?'],
    ['2024-05-12 14:04', T, 'Aku yang datang ke dekat akademi'],
    ['2024-05-12 18:47', ME, 'Kayaknya minggu ini nggak bisa'],
    ['2024-05-20 11:15', T, 'Kalau minggu depan?'],
    ['2024-05-20 11:16', T, 'Kabarin aja kapan sempatnya'],
  ]),

  room('pres', 'pres', [
    ['2024-03-22 23:10', T, 'Wonpil-ah, makasih udah dateng ke pesta awal semester tadi'],
    ['2024-03-22 23:10', T, 'Begitu kamu dateng suasananya langsung hidup ㅋㅋ'],
    ['2024-03-22 23:11', T, 'Lain kali minum berdua yuk'],
    ['2024-03-23 11:30', ME, 'Iya hyung, makasih, hyung juga udah kerja keras'],
    ['2024-04-05 10:20', T, 'Wonpil-ah, weekend ini ada waktu?'],
    ['2024-04-05 10:21', T, 'Aku dapet dua tiket pameran, mau ikut?'],
    ['2024-04-05 16:20', ME, 'Weekend aku ada les'],
    ['2024-04-05 16:22', T, 'Yah sayang bangetㅠ'],
    ['2024-04-05 16:22', T, 'Lain kali sempetin ya'],
  ]),
]

export const kakaoFriendOrder: KakaoRoomId[] = ['yh', 'jy', 'wa', 'pres', 'hs']
