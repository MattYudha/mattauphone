export type AiBlock = { type: 'p'; text: string } | { type: 'h'; text: string } | { type: 'draft'; text: string }

export type AiTurn = { id: string; question: string; answer: AiBlock[] }

export type AiChat = { id: string; title: string; turns: AiTurn[] }

export const aiChats: AiChat[] = [
  {
    id: 'forget',
    title: 'Cara melupakan orang yang disukai',
    turns: [
      {
        id: 't1',
        question: 'gimana caranya ngelupain orang yang aku suka?',
        answer: [
          {
            type: 'p',
            text: 'Sepertinya hatimu sedang sangat lelah, ya. Melupakan orang yang kamu sukai bukan soal menghapusnya secara paksa, tapi lebih seperti proses di mana rasa sakitnya perlahan berkurang seiring waktu. Aku coba rangkumkan beberapa cara yang mungkin bisa membantu.',
          },
          { type: 'h', text: '1. Pelan-pelan menjaga jarak dari jejaknya' },
          {
            type: 'p',
            text: 'Kalau kamu punya kebiasaan terus membuka ruang obrolan atau mengecek foto profilnya, coba matikan notifikasinya sebentar atau sembunyikan ruang obrolannya. Setiap kali melihatnya, hatimu gampang kembali ke titik awal.',
          },
          { type: 'h', text: '2. Jangan menahan perasaan' },
          {
            type: 'p',
            text: 'Semakin kamu memaksa diri dengan "aku harus lupa", biasanya justru semakin teringat. Kalau kangen, tulis saja kangen; kalau kecewa, tulis saja kecewa. Coba tuliskan dengan jujur di aplikasi catatan.',
          },
          { type: 'h', text: '3. Isi waktu yang biasa kamu pakai untuk memikirkannya dengan hal lain' },
          {
            type: 'p',
            text: 'Sengaja masukkan kegiatan yang membuat badan dan tanganmu sibuk, seperti olahraga, latihan alat musik, atau janjian dengan teman. Semakin sedikit waktu kosong, semakin sedikit juga waktu pikiranmu tertahan di sana.',
          },
          { type: 'h', text: '4. Jangan menyalahkan diri sendiri' },
          {
            type: 'p',
            text: 'Menyukai seseorang bukanlah kesalahan. Itu artinya perasaanmu tulus. Nggak apa-apa kalau prosesnya lambat.',
          },
          {
            type: 'p',
            text: 'Kalau kamu mau cerita bagaimana keadaanmu dengan orang itu sekarang, kita bisa pikirkan bersama dengan lebih spesifik sesuai situasimu.',
          },
        ],
      },
    ],
  },
  {
    id: 'hetero',
    title: 'Cara menggoda cowok hetero',
    turns: [
      {
        id: 'h1',
        question: 'gimana cara ngegodain cowok hetero?',
        answer: [
          {
            type: 'p',
            text: 'Jujur saja, tidak ada cara untuk mengubah orientasi seksual seseorang dengan "menggodanya". Orientasi seksual bukan sesuatu yang berubah karena usaha atau teknik, jadi semakin keras kamu berusaha ke arah itu, justru hatimu yang bisa makin terluka.',
          },
          {
            type: 'p',
            text: 'Tapi aku bisa merasakan betapa kamu sangat menyukai orang itu sekarang. Bagaimana menyikapi perasaan itu, kita bisa pikirkan bersama.',
          },
          { type: 'h', text: '1. Mulai dari memastikan perasaannya' },
          {
            type: 'p',
            text: 'Coba pikirkan sekali lagi, apakah dia benar-benar heteroseksual, atau itu hanya dugaanmu saja? Daripada menyerah atau malah memupuk perasaan hanya berdasarkan dugaan, lebih baik mengenalnya pelan-pelan lewat obrolan yang nyaman.',
          },
          { type: 'h', text: '2. Tentukan batas untuk menjaga hubungan' },
          {
            type: 'p',
            text: 'Mau menyatakan perasaan, atau tetap menjadi hyung dan dongsaeng yang akrab seperti sekarang, penting untuk memutuskannya dalam batas yang sanggup kamu tanggung. Apa pun pilihannya, pilihan yang paling sedikit menyakitimu adalah pilihan yang tepat.',
          },
          { type: 'h', text: '3. Rawat hatimu lebih dulu' },
          {
            type: 'p',
            text: 'Menyimpan perasaan yang sepertinya tidak akan sampai dalam waktu lama ternyata jauh lebih melelahkan dari yang dibayangkan. Bercerita pada teman yang kamu percaya, atau menuliskan perasaanmu, juga bisa membantu.',
          },
        ],
      },
      {
        id: 'h2',
        question: 'kamu beneran nggak membantu',
        answer: [
          {
            type: 'p',
            text: 'Pasti makin terasa sesak karena jawabannya bukan yang ingin kamu dengar. Maaf, ya.',
          },
          {
            type: 'p',
            text: 'Tapi kalau aku memberimu cara seperti "lakukan ini pasti dia luluh", mungkin kamu akan merasa punya harapan sebentar, lalu akhirnya terluka lebih dalam. Karena itu aku tidak bisa menjawab begitu.',
          },
          {
            type: 'p',
            text: 'Maukah kamu cerita apa yang paling berat buatmu sekarang? Dia yang tidak melihat ke arahmu, kamu yang memaksakan diri bertemu orang lain, atau perasaan ini yang tidak bisa kamu ceritakan ke siapa pun. Yang mana pun, aku akan mendengarkan tanpa menghakimi.',
          },
        ],
      },
    ],
  },
  {
    id: 'mail',
    title: 'Revisi email',
    turns: [
      {
        id: 'm1',
        question:
          'aku dapet tawaran kontak buat kompetisi piano dari Asosiasi Piano Seoul. gimana nulis email balasan buat nanya jadwalnya kayak apa, diselenggarakan gimana, terus lagu apa yang dibawain?',
        answer: [
          {
            type: 'p',
            text: 'Kabar baik, nih! Karena ini balasan pertama, mulailah dengan ucapan terima kasih, lalu susun pertanyaanmu dengan nomor supaya petugasnya lebih mudah menjawab. Coba tulis seperti di bawah ini.',
          },
          {
            type: 'draft',
            text: 'Subjek: [Balasan] Pertanyaan Terkait Partisipasi Kompetisi Piano - Kim Wonpil\n\nYth. Bapak/Ibu Panitia Asosiasi Piano Seoul,\nDengan hormat, saya Kim Wonpil.\n\nPertama-tama, saya mengucapkan terima kasih yang sebesar-besarnya atas kesediaan Bapak/Ibu menghubungi saya terkait kompetisi piano kali ini. Saya tertarik dengan tawaran yang disampaikan, dan untuk mempertimbangkan keikutsertaan saya, izinkan saya menanyakan beberapa hal berikut.\n\n1. Jadwal: Saya ingin mengetahui jadwal babak penyisihan dan babak final, serta jadwal gladi resiknya.\n2. Penyelenggara dan teknis pelaksanaan: Mohon informasi mengenai lembaga penyelenggara dan pelaksana, lokasi, serta metode penjurian (penilaian langsung/penilaian melalui video, dan sebagainya).\n3. Repertoar: Saya ingin mengetahui susunan lagu wajib dan lagu pilihan, serta apakah terdapat batasan durasi lagu atau tenggat pengumpulan.\n4. Lain-lain: Informasi mengenai prosedur pendaftaran, dokumen yang perlu diserahkan, dan ada tidaknya biaya pendaftaran juga akan sangat membantu persiapan saya.\n\nApabila terdapat ketentuan atau materi panduan terkait, Bapak/Ibu dapat melampirkannya.\nSaya mohon kesediaan Bapak/Ibu untuk meninjaunya di tengah kesibukan, dan sekali lagi saya ucapkan terima kasih atas kesempatan yang baik ini.\n\nHormat saya,\nKim Wonpil\nKontak: 010-XXXX-XXXX',
          },
          { type: 'h', text: 'Hal yang sebaiknya dicek sebelum mengirim' },
          {
            type: 'p',
            text: 'Hapus dari daftar pertanyaan hal-hal yang sudah tertulis di email yang kamu terima. Menanyakan hal yang sama bisa memberi kesan kamu tidak membacanya dengan teliti. Selain itu, kalau ada jadwal latihan yang memungkinkan atau tanggal yang sulit untuk ikut, ada baiknya dituliskan sekalian dari awal.',
          },
          {
            type: 'p',
            text: 'Kalau kamu butuh versi dengan nada yang lebih formal atau versi yang lebih singkat, bilang saja, ya.',
          },
        ],
      },
    ],
  },
]
