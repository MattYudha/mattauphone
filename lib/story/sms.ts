import type { ContactId } from './contacts'
import { formatClock, kst } from './time'

export type SmsMessage = {
  id: string
  from: 'me' | 'them'
  at: string
  text: string
  /** Pesan yang belum dibaca saat cerita dimulai */
  unread?: boolean
}

export type SmsThread = {
  id: string
  contactId: ContactId
  /** Utas notifikasi khusus kirim (tidak bisa dibalas) */
  notificationOnly?: boolean
  messages: SmsMessage[]
}

type Entry = [string, 'me' | 'them', string] | [string, 'me' | 'them', string, 'unread']

function thread(
  id: string,
  contactId: ContactId,
  entries: Entry[],
  notificationOnly = false,
): SmsThread {
  return {
    id,
    contactId,
    notificationOnly,
    messages: entries.map(([at, from, text, flag], i) => ({
      id: `${id}-${i}`,
      from,
      at: kst(at),
      text,
      ...(flag === 'unread' ? { unread: true } : {}),
    })),
  }
}

const ME = 'me' as const
const T = 'them' as const

export type CardTransaction = { at: string; merchant: string; amount: number; unread?: boolean }

/** Riwayat persetujuan fiktif Hyundai Card. Total akumulasi dihitung dengan menjumlahkan transaksi di bawah secara kronologis. */
export const cardTransactions: CardTransaction[] = [
  { at: '2025-11-01 10:12', merchant: 'GS25 cabang Youngwon', amount: 4800 },
  { at: '2025-11-01 19:40', merchant: 'Restoran Korea Sodam', amount: 32000 },
  { at: '2025-11-02 09:30', merchant: 'Harmony Piano Tuning', amount: 150000 },
  { at: '2025-11-03 13:20', merchant: 'Daiso', amount: 18500 },
  { at: '2025-11-04 09:00', merchant: 'Tagihan SKT', amount: 89000 },
  { at: '2025-11-04 12:30', merchant: 'Gimbap Cheonguk', amount: 8500 },
  { at: '2025-11-05 15:10', merchant: 'Alpha Stationery', amount: 42000 },
  { at: '2025-11-06 11:05', merchant: 'anybook', amount: 126000 },
  { at: '2025-11-06 20:15', merchant: 'Hyundai Department Store', amount: 168000 },
  { at: '2025-11-07 08:40', merchant: 'Starbucks', amount: 6300 },
  { at: '2025-11-09 15:30', merchant: 'Lotte Department Store', amount: 176000 },
  { at: '2025-11-09 21:10', merchant: 'CU cabang Youngwon', amount: 7200 },
  { at: '2025-11-10 17:40', merchant: 'Baemin', amount: 23900 },
  { at: '2025-11-11 11:00', merchant: 'Coupang', amount: 39800 },
  { at: '2025-11-11 19:30', merchant: 'Costco', amount: 121600 },
  { at: '2025-11-12 19:20', merchant: 'Emart', amount: 86400 },
  { at: '2025-11-13 10:00', merchant: 'Coway (langganan)', amount: 49900 },
  { at: '2025-11-13 18:00', merchant: 'Kyobo Book Centre', amount: 54000 },
  { at: '2025-11-14 12:40', merchant: 'Hyundai Department Store', amount: 189000 },
  { at: '2025-11-15 14:30', merchant: 'Olive Young', amount: 47300 },
  { at: '2025-11-15 19:50', merchant: 'Gogi Gupneun Jip', amount: 96000 },
  { at: '2025-11-16 15:20', merchant: 'Hyundai Department Store', amount: 142000 },
  { at: '2025-11-16 18:50', merchant: 'Restaurant On', amount: 128000 },
  { at: '2025-11-17 10:05', merchant: 'Coupang', amount: 68900 },
  { at: '2025-11-17 21:30', merchant: 'Musinsa', amount: 112000 },
  { at: '2025-11-18 14:10', merchant: 'Cafe Moeum', amount: 36500 },
  { at: '2025-11-18 21:00', merchant: 'Kakao T Taxi', amount: 14600 },
  { at: '2025-11-19 12:10', merchant: 'GS25 cabang Youngwon', amount: 5600 },
  { at: '2025-11-19 12:10', merchant: 'Hey Bread', amount: 7800, unread: true },
]

const won = (n: number) => `₩${n.toLocaleString('id-ID')}`

function cardEntries(): Entry[] {
  let total = 0
  return [...cardTransactions]
    .sort((a, b) => kst(a.at).localeCompare(kst(b.at)))
    .map((t) => {
      total += t.amount
      const [date] = t.at.split(' ')
      const [, m, d] = date.split('-')
      const text = `[Web]\nPersetujuan Hyundai Card\nKim W*npil\n${won(t.amount)} bayar penuh\n${d}/${m} ${formatClock(kst(t.at))}\n${t.merchant}\nAkumulasi ${won(total)}`
      return (t.unread ? [t.at, T, text, 'unread'] : [t.at, T, text]) as Entry
    })
}

const AD_FOOTER = '\n\nBerhenti berlangganan gratis 080-850-1102'

const hyundaiDeptEntries: Entry[] = (
  [
    ['2025-11-01 10:30', '(Iklan)[Hyundai Department Store] Pelanggan Kim Wonpil, info saldo H.Point bulan November\nPoin tersedia: 12.480P\nPoin yang akan hangus (30/11): 1.200P\nPoin dapat digunakan di department store dan mitra H.Point.'],
    ['2025-11-03 11:00', '(Iklan)[Hyundai Department Store] Info keuntungan member VIP bulan November\nBulan ini Anda mendapat parkir gratis 3 jam dan 1 minuman gratis di lounge.\nCek di aplikasi Hyundai Department Store > Membership.'],
    ['2025-11-05 10:00', '(Iklan)[Hyundai Department Store cabang Trade Center] Winter Outer Fair\n7/11 (Jum)~16/11 (Min), area event lantai 9\nDiskon hingga 50% untuk padding & mantel brand populer'],
    ['2025-11-07 09:30', '(Iklan)[Hyundai Department Store] Kupon khusus akhir pekan sudah tiba!\nPotongan ₩5.000 untuk pembelian min. ₩50.000 (8/11~9/11)\nUnduh di menu Kupon aplikasi untuk menggunakannya.'],
    ['2025-11-10 10:00', '(Iklan)[Hyundai Department Store] Promo segar Food Hall minggu ini\nDiskon hingga 30% untuk buah musiman & paket hadiah Hanwoo\n10/11 (Sen)~13/11 (Kam), Food Hall B1'],
    ['2025-11-12 14:00', '[Hyundai Department Store] Info perubahan jam operasional\nPada 14/11 (Jum), cabang Pangyo akan tutup lebih awal pukul 20.00 karena pemeliharaan fasilitas.\nMohon menjadi perhatian.'],
    ['2025-11-13 18:00', '(Iklan)[Hyundai Department Store] Event poin ganda H.Point\n14/11~16/11 tambahan poin 2% dari total belanja\nJangan lupa tunjukkan barcode membership Anda.'],
    ['2025-11-15 10:00', '(Iklan)[Hyundai Department Store] Kupon ulang tahun sudah kami siapkan lebih awal\nKupon diskon ₩10.000 untuk brand kecantikan telah diterbitkan.\nBerlaku hingga: 31/12'],
    ['2025-11-17 11:30', '(Iklan)[Hyundai Department Store] Winter Holiday Market OPEN\n21/11 (Jum)~25/12 (Kam), Atrium lantai 1\nHadiah untuk pengunjung pertama dalam rangka pembukaan pop-up pernak-pernik & dessert Natal'],
    ['2025-11-19 10:00', '(Iklan)[Hyundai Department Store] Info awal Black Friday\n21/11 (Jum)~30/11 (Min) diskon hingga 70% di seluruh gedung\nMember dapat berbelanja sehari lebih awal pada 20/11 (Kam).'],
  ] as const
).map(([at, text]) => [at, T, text.startsWith('(Iklan)') ? text + AD_FOOTER : text, 'unread'] as Entry)

export const cardTotal = cardTransactions.reduce((sum, t) => sum + t.amount, 0)

export const smsThreads: SmsThread[] = [
  thread('seunga', 'seungaMom', [
    ['2025-10-27 18:10', T, 'Seonsaengnim, selamat sore. Saya mamanya Seunga. Seunga sudah bawa pulang partitur lagu untuk pentas minggu ini, ada bagian yang perlu saya perhatikan waktu dia latihan di rumah?'],
    ['2025-10-27 18:32', ME, 'Eomeonim, selamat sore! Bagian awalnya Seunga udah bagus banget kok. Cukup bantu lihat tanda dinamika di bagian tengah sesekali aja :)'],
    ['2025-10-27 18:35', T, 'Baik, terima kasih seonsaengnim^^'],
    ['2025-11-11 08:40', T, 'Seonsaengnim, selamat pagi. Seunga dari semalam kayaknya mau flu, jadi sepertinya les hari ini libur dulu. Mohon maaf ya.'],
    ['2025-11-11 09:05', ME, 'Eomeonim, selamat pagi. Terima kasih sudah mengabari. Semoga Seunga cepat sembuh ya, istirahat yang cukup!'],
    ['2025-11-11 09:06', ME, 'Untuk les penggantinya bisa Senin depan (17) jam 16.00 atau Rabu (19) jam 17.00. Kabari aja waktu yang paling pas ya.'],
    ['2025-11-11 12:20', T, 'Senin jam 4 saja ya. Terima kasih atas pengertiannya.'],
    ['2025-11-11 12:31', ME, 'Oke, saya jadwalkan Senin tanggal 17 jam 16.00 ya. Salam buat Seunga, semoga cepat pulih :)'],
    ['2025-11-16 20:10', T, 'Seonsaengnim, Seunga sudah sembuh. Besok jam 4 saya antar ya!'],
    ['2025-11-16 20:24', ME, 'Syukurlah! Sampai ketemu besok, eomeonim :)'],
  ]),

  thread('yuchan', 'yuchanMom', [
    ['2025-11-06 21:15', T, 'Seonsaengnim, maaf mengganggu malam-malam. Yuchan akhir-akhir ini kesulitan main pakai dua tangan, kira-kira di rumah saya bisa bantu gimana ya?'],
    ['2025-11-06 21:40', ME, 'Eomeonim, selamat malam! Melodi tangan kanan Yuchan sekarang udah stabil banget lho.'],
    ['2025-11-06 21:41', ME, 'Main dua tangan memang awalnya susah buat semua anak. Di rumah cukup latihan tangan kiri aja tiga kali, terus dua tangan pelan-pelan banget sekali aja.'],
    ['2025-11-06 21:45', T, 'Oh begitu. Sebaiknya pakai metronom juga nggak?'],
    ['2025-11-06 21:52', ME, 'Untuk sekarang belum perlu! Nanti bulan depan pas mulai atur tempo saya kasih tahu caranya.'],
    ['2025-11-14 19:05', T, 'Seonsaengnim, buku Beyer jilid 2 udah hampir selesai, perlu beli buku berikutnya dari sekarang?'],
    ['2025-11-14 19:30', ME, 'Progres Yuchan cepat banget sekarang! Minggu ini untuk pertama kalinya dia main dua tangan sampai akhir tanpa berhenti :)'],
    ['2025-11-14 19:31', ME, 'Buku berikutnya Czerny 100. Nanti saya siapkan di akademi, jadi nggak perlu beli sendiri ya.'],
    ['2025-11-14 19:33', T, 'Wah, nanti di rumah saya puji dia banyak-banyak. Terima kasih seonsaengnim!'],
  ]),

  thread('card', 'hyundai', cardEntries(), true),

  thread('hyundaiDept', 'hyundaiDept', hyundaiDeptEntries, true),

  thread(
    'yhCatch',
    'yhSms',
    [['2025-11-19 12:16', T, '[Web]\n[Catch Call]\nKang Younghyun (010-1219-0482) menelepon Anda pada 19 November pukul 12.16.']],
    true,
  ),

  thread('jihoo', 'jihoo', [
    ['2025-11-05 19:12', T, 'Seonsaengnim ini Jihoo'],
    ['2025-11-05 19:12', T, 'aku kirim dari hp mama'],
    ['2025-11-05 19:20', ME, 'Oh, Jihoo! Ada apa?'],
    ['2025-11-05 19:21', T, 'besok boleh main board game lagi nggak?'],
    ['2025-11-05 19:25', ME, 'Kalau lesnya rajin, habis itu kita main satu ronde!'],
    ['2025-11-05 19:25', T, 'oke!!!'],
    ['2025-11-12 20:03', T, 'Seonsaengnim aku hari ini latihan lima kali di rumah'],
    ['2025-11-12 20:03', T, 'tapi tangan kiri salah terus'],
    ['2025-11-12 20:10', ME, 'Latihan sampai lima kali? Jihoo rajin banget 😊'],
    ['2025-11-12 20:10', ME, 'Tangan kiri pelan-pelan aja nggak apa-apa. Nanti kita coba bareng sama seonsaengnim ya!'],
    ['2025-11-12 20:11', T, 'berarti dapat stiker dua?'],
    ['2025-11-12 20:13', ME, 'Iya dong! Seonsaengnim kasih dua stiker'],
    ['2025-11-18 18:30', T, 'Seonsaengnim board game barunya udah datang?'],
    ['2025-11-18 18:31', T, 'kata kakak udah datang'],
    ['2025-11-18 18:40', ME, 'Iya, hari ini udah sampai! Habis les berikutnya kita coba bareng ya'],
    ['2025-11-18 18:41', T, 'asiiik seneng bangett'],
  ]),

  thread(
    'cj',
    'cj',
    [
      ['2025-11-08 11:42', T, '[CJ Logistics] Paket Anda telah berhasil dikirim.\nNama barang: anybook jilid partitur\nLokasi pengiriman: depan pintu masuk Youngwon Piano'],
      ['2025-11-12 15:18', T, '[CJ Logistics] Paket Anda telah berhasil dikirim.\nNama barang: suplemen vitamin C\nLokasi pengiriman: depan pintu masuk Youngwon Piano'],
      ['2025-11-18 14:55', T, '[CJ Logistics] Paket Anda telah berhasil dikirim.\nNama barang: set board game anak\nLokasi pengiriman: depan pintu masuk Youngwon Piano'],
    ],
    true,
  ),
]
