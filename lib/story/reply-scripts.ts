import type { AutoReplyBranch, AutoReplyRoom } from './auto-reply'

/**
 * Naskah percakapan lanjutan (draf) untuk ruang yang bisa dibalas.
 *
 * Giliran pertama memilih cabang (A/B) dan dibalas oleh `autoReplyLines`. Setelah itu percakapan
 * berlanjut beberapa giliran dalam cabang yang sama. Tiap giliran punya dua pilihan untuk bar QuickType;
 * ketikan bebas (keyboard fisik / mengetik manual) dijawab dengan `freeReplies` supaya tetap nyambung.
 */

export type ScriptOption = { text: string; replies: string[] }
export type ScriptTurn = { options: [ScriptOption, ScriptOption]; freeReplies: string[] }

/** Kalimat Wonpil untuk giliran pertama, satu per cabang. */
export const FIRST_TURN: Record<AutoReplyRoom, Record<AutoReplyBranch, string>> = {
  yh: {
    A: 'Nggak kok hyung, aku masih di akademi',
    B: 'Iya, aku ketemu dia. Terus kenapa?',
  },
  jy: {
    A: 'Nggak usah ke sini, aku mau pulang sendiri',
    B: 'Oke, tunggu bentar ya ㅎㅎ',
  },
}

export const FOLLOW_UPS: Record<AutoReplyRoom, Record<AutoReplyBranch, ScriptTurn[]>> = {
  yh: {
    // Wonpil menyangkal; Younghyun menyuruhnya menunggu di parkiran, padahal Junyoung sudah di sana.
    A: [
      {
        options: [
          { text: 'Hah? Kenapa di parkiran? Aku masih beresin kelas, hyung', replies: ['Udah, turun aja', 'Aku udah dekat'] },
          { text: 'Hyung beneran mau ke sini? Kan hyung masih capek', replies: ['Kamu nyuruh aku nggak dateng?', 'Turun. Sekarang.'] },
        ],
        freeReplies: ['Nanti aja ngomongnya', 'Turun ke parkiran'],
      },
      {
        options: [
          { text: 'Iya iya, aku turun sekarang', replies: ['Pakai jaket', 'Di luar dingin'] },
          { text: 'Hyung jangan marah-marah dong ㅠㅠ', replies: ['Aku nggak marah', 'Cepet turun'] },
        ],
        freeReplies: ['Iya', 'Cepet turun'],
      },
      {
        options: [
          { text: 'Hyung udah sampai mana?', replies: ['Lampu merah depan akademimu'] },
          { text: 'Oke, aku tunggu di parkiran ya hyung', replies: ['Jangan ke mana-mana'] },
        ],
        freeReplies: ['Bentar lagi sampai'],
      },
    ],
    // Wonpil mengaku; Younghyun marah dan sedang dalam perjalanan.
    B: [
      {
        options: [
          { text: 'Kenapa sih hyung? Dia cuma ngajak makan malam', replies: ['Cuma?', 'Kamu nggak tahu dia orang kayak apa'] },
          { text: 'Hyung nggak berhak ngatur aku ketemu siapa', replies: ['Iya. Aku emang nggak berhak', 'Tapi aku tetap ke sana'] },
        ],
        freeReplies: ['Kita ngomong langsung aja', 'Aku udah dekat'],
      },
      {
        options: [
          { text: 'Hyung kenapa jadi begini... aku nggak ngerti ㅠㅠ', replies: ['Nanti aku jelasin', 'Jangan ke mana-mana'] },
          { text: 'Terserah hyung. Aku tetap pergi', replies: ['Wonpil-ah', 'Sekali ini aja dengerin aku'] },
        ],
        freeReplies: ['Tunggu aku', 'Jangan pergi dulu'],
      },
      {
        options: [
          { text: 'Oke... aku tunggu hyung di sini', replies: ['Makasih'] },
          { text: 'Hyung, aku takut kalau hyung marah begini', replies: ['Aku nggak marah sama kamu', 'Aku cuma takut kamu kenapa-kenapa'] },
        ],
        freeReplies: ['Aku sampai sebentar lagi'],
      },
    ],
  },
  jy: {
    // Wonpil menolak; Junyoung bingung dan pelan-pelan mundur.
    A: [
      {
        options: [
          { text: 'Maaf, aku lagi nggak enak badan. Lain kali aja ya', replies: ['Oh... gitu ya', 'Mau aku antar pulang aja?'] },
          { text: 'Aku udah ada janji sama orang lain', replies: ['Sama siapa?', 'Kita kan udah janjian dari kemarin'] },
        ],
        freeReplies: ['Wonpil-ssi lagi ada apa?', 'Aku jadi khawatir'],
      },
      {
        options: [
          { text: 'Nggak usah, aku pulang sendiri. Makasih ya', replies: ['Oke deh', 'Kabari aku kalau udah sampai rumah ya'] },
          { text: 'Maaf Junyoung-ssi. Jangan tunggu aku', replies: ['...Iya', 'Hati-hati, Wonpil-ssi'] },
        ],
        freeReplies: ['Iya, aku ngerti', 'Kabari aku nanti ya'],
      },
      {
        options: [
          { text: 'Maaf ya udah bikin kamu nunggu', replies: ['Nggak apa-apa kok', 'Istirahat yang cukup ya'] },
          { text: 'Nanti aku kabari lagi', replies: ['Oke, aku tunggu kabarnya'] },
        ],
        freeReplies: ['Oke, hati-hati ya'],
      },
    ],
    // Wonpil menerima; Junyoung senang menunggu di parkiran.
    B: [
      {
        options: [
          { text: 'Mungkin ㅎㅎ aku turun 5 menit lagi ya', replies: ['Oke, aku tunggu', 'Pelan-pelan aja'] },
          { text: 'Jangan geer dulu~ aku cuma lapar', replies: ['Hahaha iya iya', 'Aku udah pesan tempat kok'] },
        ],
        freeReplies: ['ㅎㅎ aku tunggu di mobil ya'],
      },
      {
        options: [
          { text: 'Kita mau makan di mana?', replies: ['Rahasia ㅎㅎ', 'Pokoknya kamu pasti suka'] },
          { text: 'Junyoung-ssi, makasih udah jemput ya', replies: ['Sama-sama', 'Aku senang kok bisa jemput kamu'] },
        ],
        freeReplies: ['Nanti aku ceritain di mobil'],
      },
      {
        options: [
          { text: 'Oke, aku turun sekarang', replies: ['Aku di mobil putih dekat pintu masuk'] },
          { text: 'Tunggu ya, aku beresin tas dulu', replies: ['Santai aja, nggak usah buru-buru'] },
        ],
        freeReplies: ['Aku tunggu ya'],
      },
    ],
  },
}

/** id pesan balasan giliran lanjutan; dipakai untuk melanjutkan tanpa dobel setelah refresh. */
export const followUpReplyId = (room: AutoReplyRoom, branch: AutoReplyBranch, turn: number, choice: number | 'free', index: number) =>
  `script-${room}-${branch}-${turn + 1}-${choice}-${index + 1}`
