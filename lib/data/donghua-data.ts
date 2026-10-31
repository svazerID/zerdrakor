import { Drakor, Genre, ScheduleEntry, RankingEntry, Episode } from '@/types/donghua';

export const GENRES: Genre[] = [
  { id: 'rom-com', name: 'Rom-Com', slug: 'rom-com', description: 'Komedi romantis manis penuh tawa, cinta manis, dan chemistry menggemaskan.', count: 28 },
  { id: 'melodrama', name: 'Melodrama', slug: 'melodrama', description: 'Kisah cinta mendalam yang menguras air mata dan emosi penuh liku kehidupan.', count: 22 },
  { id: 'crime-law', name: 'Hukum & Kriminal', slug: 'crime-law', description: 'Aksi jaksa, pengacara jenius, polisi, dan mafia mengungkap konspirasi jahat.', count: 19 },
  { id: 'thriller', name: 'Thriller & Misteri', slug: 'thriller', description: 'Ketegangan psikologis, misteri pembunuhan berantai, dan aksi balas dendam.', count: 18 },
  { id: 'fantasy-timetravel', name: 'Fantasi & Time Travel', slug: 'fantasy-timetravel', description: 'Perjalanan melintasi waktu, reinkarnasi, kekuatan gaib, dan takdir ilahi.', count: 15 },
  { id: 'medical', name: 'Medis & Rumah Sakit', slug: 'medical', description: 'Perjuangan para dokter bedah dan perawat menyelamatkan nyawa di ruang operasi.', count: 12 },
  { id: 'slice-of-life', name: 'Slice of Life', slug: 'slice-of-life', description: 'Potret kehidupan nyata, hangatnya persahabatan, keluarga, dan impian masa muda.', count: 20 },
  { id: 'action', name: 'Action & Superpower', slug: 'action', description: 'Koreografi laga memukau, agen rahasia, manusia berkekuatan super, dan laga intens.', count: 14 },
  { id: 'saeguk', name: 'Sejarah / Saeguk', slug: 'saeguk', description: 'Intrik politik istana era Dinasti Joseon, cinta terlarang, dan perang kerajaan.', count: 11 },
  { id: 'kmovie', name: 'Film Korea (K-Movie)', slug: 'kmovie', description: 'Film layar lebar bioskop Korea Selatan berdurasi penuh kualitas bioskop.', count: 8 },
];

const SAMPLE_VIDEOS = {
  server1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  server2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  server3: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  server4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
};

const createSampleEpisodes = (drakorId: string, count: number, baseTitle: string): Episode[] => {
  return Array.from({ length: count }, (_, i) => {
    const epNum = i + 1;
    return {
      id: `${drakorId}-ep-${epNum}`,
      drakorId,
      title: `Episode ${epNum}: ${baseTitle} - Bagian ${epNum}`,
      episodeNumber: epNum,
      duration: '65:30',
      releasedAt: '2026-10-25',
      videoSources: [
        {
          id: `src-${epNum}-1080`,
          name: 'Server VIP 1080p Ultra HD',
          quality: '1080p',
          url: SAMPLE_VIDEOS.server3,
          type: 'mp4',
          serverName: 'Direct Korean CDN',
        },
        {
          id: `src-${epNum}-720`,
          name: 'Server Utama 720p HD',
          quality: '720p',
          url: SAMPLE_VIDEOS.server1,
          type: 'mp4',
          serverName: 'Fast Streamer',
        },
        {
          id: `src-${epNum}-480`,
          name: 'Server Hemat Kuota 480p',
          quality: '480p',
          url: SAMPLE_VIDEOS.server4,
          type: 'mp4',
          serverName: 'Mobile Saver',
        },
      ],
      subtitleSources: [
        { id: 'sub-id', language: 'id', label: 'Bahasa Indonesia (Resmi)', isDefault: true },
        { id: 'sub-en', language: 'en', label: 'English Subtitle' },
      ],
    };
  });
};

export const DRAKOR_LIST: Drakor[] = [
  {
    id: 'queen-of-tears',
    slug: 'queen-of-tears',
    title: 'Queen of Tears',
    hangulTitle: '눈물의 여왕',
    romanizedTitle: 'Nunmul-ui Yeowang',
    alternativeTitles: ['Ratu Air Mata', 'Queen of Tears Season 1'],
    synopsis:
      'Hong Hae-in, pewaris generasi ketiga konglomerat Queens Group yang dikenal sebagai "ratu department store", menikah dengan Baek Hyun-woo, pengacara cerdas asal pedesaan Yongdu-ri. Memasuki tahun ketiga pernikahan, krisis rumah tangga yang dingin dan vonis penyakit misterius memicu kembali bara cinta yang terkubur, di tengah perebutan kekuasaan klan konglomerat.',
    posterUrl: '/images/poster_queen_of_tears.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Rom-Com', 'Melodrama', 'Slice of Life'],
    releaseYear: 2024,
    network: 'tvN / Netflix',
    director: 'Jang Young-woo, Kim Hee-won',
    cast: ['Kim Soo-hyun', 'Kim Ji-won', 'Park Sung-hoon', 'Kwak Dong-yeon', 'Lee Joo-bin'],
    rating: 9.8,
    views: 3450000,
    totalEpisodes: 16,
    latestEpisode: 16,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    broadcastSchedule: 'Sabtu & Minggu 21:20 KST (19:20 WIB)',
    featured: true,
    isEditorPick: true,
    createdAt: '2024-03-09',
    updatedAt: '2026-10-28',
    episodes: createSampleEpisodes('queen-of-tears', 16, 'Air Mata Ratu dan Romansa Yongdu-ri'),
  },
  {
    id: 'lovely-runner',
    slug: 'lovely-runner',
    title: 'Lovely Runner',
    hangulTitle: '선재 업고 튀어',
    romanizedTitle: 'Seonjae Eopgo Twieo',
    alternativeTitles: ['Gendong Seon-jae dan Lari', 'Run Away With Sun-jae'],
    synopsis:
      'Im Sol, seorang penggemar setia yang lumpuh akibat kecelakaan, menemukan semangat hidup berkat musik vokalis top Ryu Sun-jae. Ketika Sun-jae dikabarkan meninggal tragis, jam tangan misterius membawa Sol kembali ke 15 tahun lalu saat mereka masih siswa SMA tahun 2008. Sol bertekad mengubah takdir dan menyelamatkan pria yang dicintainya.',
    posterUrl: '/images/poster_lovely_runner.jpg',
    bannerUrl: '/images/poster_lovely_runner.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Rom-Com', 'Fantasi & Time Travel', 'Slice of Life'],
    releaseYear: 2024,
    network: 'tvN / Viu',
    director: 'Yoon Jong-ho, Kim Tae-yeop',
    cast: ['Byeon Woo-seok', 'Kim Hye-yoon', 'Song Geon-hee', 'Lee Seung-hyub'],
    rating: 9.8,
    views: 3120000,
    totalEpisodes: 16,
    latestEpisode: 16,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    broadcastSchedule: 'Senin & Selasa 20:50 KST (18:50 WIB)',
    featured: true,
    isEditorPick: true,
    createdAt: '2024-04-08',
    updatedAt: '2026-10-29',
    episodes: createSampleEpisodes('lovely-runner', 16, 'Melintasi Waktu Demi Menyelamatkanmu'),
  },
  {
    id: 'vincenzo',
    slug: 'vincenzo',
    title: 'Vincenzo',
    hangulTitle: '빈센조',
    romanizedTitle: 'Binsenjo',
    alternativeTitles: ['Vincenzo Cassano'],
    synopsis:
      'Vincenzo Cassano, pengacara Italia berdarah Korea yang merupakan penasihat (consigliere) keluarga mafia Cassano, kembali ke Seoul demi mengambil 1,5 ton emas tersembunyi di bawah Geumga Plaza. Terjebak dalam kejahatan konglomerat Babel Group yang korup, Vincenzo bekerja sama dengan pengacara Hong Cha-young memakai metode mafia untuk membalas dendam dengan kejam.',
    posterUrl: '/images/poster_vincenzo.jpg',
    bannerUrl: '/images/poster_vincenzo.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Hukum & Kriminal', 'Action & Superpower', 'Thriller & Misteri'],
    releaseYear: 2021,
    network: 'tvN / Netflix',
    director: 'Kim Hee-won',
    cast: ['Song Joong-ki', 'Jeon Yeo-been', 'Ok Taec-yeon', 'Kwak Dong-yeon'],
    rating: 9.7,
    views: 2980000,
    totalEpisodes: 20,
    latestEpisode: 20,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    featured: true,
    isEditorPick: true,
    createdAt: '2021-02-20',
    updatedAt: '2026-05-02',
    episodes: createSampleEpisodes('vincenzo', 20, 'Keadilan Gaya Mafia di Geumga Plaza'),
  },
  {
    id: 'crash-landing-on-you',
    slug: 'crash-landing-on-you',
    title: 'Crash Landing on You',
    hangulTitle: '사랑의 불시착',
    romanizedTitle: 'Sarang-ui Bulsichak',
    alternativeTitles: ['CLOY', 'Mendarat Darurat Cinta'],
    synopsis:
      'Yoon Se-ri, pewaris konglomerat Korea Selatan dan CEO fashion ternama, mengalami kecelakaan paralayang akibat badai tornado hingga mendarat darurat di zona demiliterisasi Korea Utara. Di sana, ia ditemukan oleh Ri Jeong-hyeok, perwira militer elit Korea Utara yang melindunginya dan berusaha memulangkannya secara rahasia.',
    posterUrl: '/images/hero_drakor_spotlight.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Rom-Com', 'Melodrama', 'Action & Superpower'],
    releaseYear: 2019,
    network: 'tvN / Netflix',
    director: 'Lee Jung-hyo',
    cast: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye', 'Kim Jung-hyun'],
    rating: 9.7,
    views: 4200000,
    totalEpisodes: 16,
    latestEpisode: 16,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    featured: true,
    isEditorPick: true,
    createdAt: '2019-12-14',
    updatedAt: '2026-02-16',
    episodes: createSampleEpisodes('crash-landing-on-you', 16, 'Cinta Melintasi Garis Batas Dua Negara'),
  },
  {
    id: 'love-next-door',
    slug: 'love-next-door',
    title: 'Love Next Door',
    hangulTitle: '엄마친구아들',
    romanizedTitle: 'Eommachingu-adeul',
    alternativeTitles: ['Anak Teman Ibu', 'Mom’s Friend’s Son'],
    synopsis:
      'Bae Seok-ryu, seorang manajer sukses di Amerika Serikat yang tiba-tiba mengundurkan diri dan membatalkan pertunangannya, pulang ke kampung halamannya di Seoul untuk memulai hidup baru. Di sana ia bertemu kembali dengan Choi Seung-hyo, arsitek muda ternama sekaligus anak teman ibunya yang mengetahui semua momen memalukan masa kecilnya.',
    posterUrl: '/images/poster_lovely_runner.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'ongoing',
    genres: ['Rom-Com', 'Slice of Life', 'Melodrama'],
    releaseYear: 2024,
    network: 'tvN / Netflix',
    director: 'Yoo Je-won',
    cast: ['Jung Hae-in', 'Jung So-min', 'Kim Ji-eun', 'Yun Ji-on'],
    rating: 9.4,
    views: 1840000,
    totalEpisodes: 16,
    latestEpisode: 14,
    subtitleLanguages: ['Sub Indo'],
    broadcastSchedule: 'Sabtu & Minggu 21:20 KST (19:20 WIB)',
    createdAt: '2024-08-17',
    updatedAt: '2026-10-27',
    episodes: createSampleEpisodes('love-next-door', 14, 'Cinta yang Bersemi di Lingkungan Masa Kecil'),
  },
  {
    id: 'the-judge-from-hell',
    slug: 'the-judge-from-hell',
    title: 'The Judge from Hell',
    hangulTitle: '지옥에서 온 판사',
    romanizedTitle: 'Ji-og-eseo On Pansa',
    alternativeTitles: ['Hakim dari Neraka', 'Judge Justitia'],
    synopsis:
      'Kang Bit-na adalah hakim elit yang dirasuki oleh iblis Justitia dari neraka. Tugasnya adalah mengirim sepuluh penjahat kejam tanpa penyesalan ke neraka dengan cara menghukum mereka secara brutal. Pertemuannya dengan Han Da-on, detektif hangat dengan luka masa lalu kelam, mulai mengguncang sifat dinginnya.',
    posterUrl: '/images/poster_vincenzo.jpg',
    bannerUrl: '/images/poster_vincenzo.jpg',
    type: 'series',
    status: 'ongoing',
    genres: ['Hukum & Kriminal', 'Fantasi & Time Travel', 'Thriller & Misteri'],
    releaseYear: 2024,
    network: 'SBS / Disney+',
    director: 'Park Jin-pyo',
    cast: ['Park Shin-hye', 'Kim Jae-young', 'Kim In-kwon', 'Kim Ah-young'],
    rating: 9.5,
    views: 1620000,
    totalEpisodes: 14,
    latestEpisode: 12,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    broadcastSchedule: 'Jumat & Sabtu 22:00 KST (20:00 WIB)',
    isEditorPick: true,
    createdAt: '2024-09-21',
    updatedAt: '2026-10-26',
    episodes: createSampleEpisodes('the-judge-from-hell', 12, 'Pengadilan Neraka dan Vonis Tanpa Ampun'),
  },
  {
    id: 'moving',
    slug: 'moving',
    title: 'Moving',
    hangulTitle: '무빙',
    romanizedTitle: 'Mubing',
    alternativeTitles: ['Moving Superpower'],
    synopsis:
      'Tiga remaja SMA mewarisi kekuatan super luar biasa dari orang tua mereka yang merupakan mantan agen rahasia intelijen: terbang, regenerasi kilat, dan kekuatan fisik super. Mereka berusaha hidup normal dan menyembunyikan identitas hingga sebuah organisasi misterius mulai memburu para pemilik kekuatan super.',
    posterUrl: '/images/poster_queen_of_tears.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Action & Superpower', 'Thriller & Misteri', 'Slice of Life'],
    releaseYear: 2023,
    network: 'Disney+ Korea',
    director: 'Park In-je',
    cast: ['Ryu Seung-ryong', 'Han Hyo-joo', 'Jo In-sung', 'Cha Tae-hyun', 'Go Youn-jung'],
    rating: 9.7,
    views: 2850000,
    totalEpisodes: 20,
    latestEpisode: 20,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    isEditorPick: true,
    createdAt: '2023-08-09',
    updatedAt: '2026-09-20',
    episodes: createSampleEpisodes('moving', 20, 'Kekuatan Rahasia dan Pengorbanan Orang Tua'),
  },
  {
    id: 'hospital-playlist',
    slug: 'hospital-playlist',
    title: 'Hospital Playlist (Musim 1 & 2)',
    hangulTitle: '슬기로운 의사생활',
    romanizedTitle: 'Seulgirowun Uisasaenghwal',
    alternativeTitles: ['Wise Doctor Life', 'Kehidupan Dokter yang Bijak'],
    synopsis:
      'Lima dokter spesialis yang telah bersahabat erat sejak masuk sekolah kedokteran pada tahun 1999 bekerja bersama di Pusat Medis Yulje. Di tengah kesibukan menangani pasien di ruang operasi gawat darurat, mereka menyempatkan diri bermain band musik bersama setiap akhir pekan.',
    posterUrl: '/images/poster_lovely_runner.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Medis & Rumah Sakit', 'Slice of Life', 'Rom-Com'],
    releaseYear: 2020,
    network: 'tvN / Netflix',
    director: 'Shin Won-ho',
    cast: ['Jo Jung-suk', 'Yoo Yeon-seok', 'Jung Kyung-ho', 'Kim Dae-myung', 'Jeon Mi-do'],
    rating: 9.8,
    views: 3100000,
    totalEpisodes: 24,
    latestEpisode: 24,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    createdAt: '2020-03-12',
    updatedAt: '2026-09-16',
    episodes: createSampleEpisodes('hospital-playlist', 24, 'Lagu Persahabatan di Koridor Rumah Sakit'),
  },
  {
    id: 'exhuma',
    slug: 'exhuma-the-movie',
    title: 'Exhuma (Film)',
    hangulTitle: '파묘',
    romanizedTitle: 'Pamyo',
    alternativeTitles: ['Pembongkaran Makam Terkutuk'],
    synopsis:
      'Sepasang dukun muda berbakat Hwa-rim dan Bong-gil disewa oleh keluarga konglomerat Korea di Los Angeles untuk menyelamatkan bayi mereka dari kutukan leluhur. Bersama ahli feng shui Sang-deok dan petugas pemakaman Yeong-geun, mereka membongkar makam terkutuk di bukit terpencil perbatasan Korea, tanpa menyadari entitas jahat terkubur di bawahnya.',
    posterUrl: '/images/poster_vincenzo.jpg',
    bannerUrl: '/images/poster_vincenzo.jpg',
    type: 'movie',
    status: 'completed',
    genres: ['Film Korea (K-Movie)', 'Thriller & Misteri'],
    releaseYear: 2024,
    network: 'Showbox (Bioskop)',
    director: 'Jang Jae-hyun',
    cast: ['Choi Min-sik', 'Kim Go-eun', 'Yoo Hae-jin', 'Lee Do-hyun'],
    rating: 9.5,
    views: 2400000,
    totalEpisodes: 1,
    latestEpisode: 1,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    isEditorPick: true,
    createdAt: '2024-02-22',
    updatedAt: '2026-06-01',
    episodes: [
      {
        id: 'ex-ep-1',
        drakorId: 'exhuma',
        title: 'Exhuma: Full Movie Bioskop (Durasi Penuh)',
        episodeNumber: 1,
        duration: '2:14:20',
        releasedAt: '2024-02-22',
        videoSources: [
          {
            id: 'ex-vip-1080',
            name: 'Server Bioskop 1080p Ultra HD',
            quality: '1080p',
            url: SAMPLE_VIDEOS.server3,
            type: 'mp4',
            serverName: 'Direct Cinema CDN',
          },
          {
            id: 'ex-720',
            name: 'Server Utama 720p',
            quality: '720p',
            url: SAMPLE_VIDEOS.server1,
            type: 'mp4',
            serverName: 'Fast Streamer',
          },
        ],
        subtitleSources: [
          { id: 'sub-id', language: 'id', label: 'Bahasa Indonesia (Resmi)', isDefault: true },
          { id: 'sub-en', language: 'en', label: 'English Subtitle' },
        ],
      },
    ],
  },
  {
    id: 'parasite',
    slug: 'parasite-the-movie',
    title: 'Parasite (Film)',
    hangulTitle: '기생충',
    romanizedTitle: 'Gisaengchung',
    alternativeTitles: ['Parasit (Pemenang 4 Piala Oscar)'],
    synopsis:
      'Keluarga Kim yang menganggur dan tinggal di apartemen semi-basement sempit satu per satu menyusup sebagai tutor, terapis seni, sopir, dan pengurus rumah tangga di kediaman mewah keluarga Park yang kaya raya. Kehidupan mereka yang nyaman terancam hancur ketika rahasia gelap bunker bawah tanah terungkap.',
    posterUrl: '/images/poster_queen_of_tears.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'movie',
    status: 'completed',
    genres: ['Film Korea (K-Movie)', 'Thriller & Misteri', 'Melodrama'],
    releaseYear: 2019,
    network: 'CJ Entertainment',
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
    rating: 9.9,
    views: 4500000,
    totalEpisodes: 1,
    latestEpisode: 1,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    isEditorPick: true,
    createdAt: '2019-05-30',
    updatedAt: '2026-02-10',
    episodes: [
      {
        id: 'par-ep-1',
        drakorId: 'parasite',
        title: 'Parasite Full Movie Bioskop (Piala Oscar)',
        episodeNumber: 1,
        duration: '2:12:00',
        releasedAt: '2019-05-30',
        videoSources: [
          {
            id: 'par-vip-1080',
            name: 'Server Bioskop 1080p Ultra HD',
            quality: '1080p',
            url: SAMPLE_VIDEOS.server3,
            type: 'mp4',
            serverName: 'Direct Cinema CDN',
          },
        ],
        subtitleSources: [
          { id: 'sub-id', language: 'id', label: 'Bahasa Indonesia (Resmi)', isDefault: true },
          { id: 'sub-en', language: 'en', label: 'English Subtitle' },
        ],
      },
    ],
  },
  {
    id: 'business-proposal',
    slug: 'business-proposal',
    title: 'Business Proposal',
    hangulTitle: '사내맞선',
    romanizedTitle: 'Sanaematseon',
    alternativeTitles: ['Kencan Buta Kantor'],
    synopsis:
      'Shin Ha-ri setuju menggantikan sahabatnya yang kaya raya dalam sebuah kencan buta dengan niat membuat pria tersebut ilfil dan kabur. Betapa terkejutnya Ha-ri saat mengetahui bahwa pria teman kencan butanya adalah Kang Tae-moo, CEO tampan dan workaholic di perusahaan tempat ia bekerja sebagai peneliti makanan.',
    posterUrl: '/images/poster_queen_of_tears.jpg',
    bannerUrl: '/images/hero_drakor_spotlight.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Rom-Com', 'Slice of Life'],
    releaseYear: 2022,
    network: 'SBS / Netflix',
    director: 'Park Seon-ho',
    cast: ['Ahn Hyo-seop', 'Kim Se-jeong', 'Kim Min-kyu', 'Seol In-ah'],
    rating: 9.5,
    views: 2650000,
    totalEpisodes: 12,
    latestEpisode: 12,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    createdAt: '2022-02-28',
    updatedAt: '2026-04-05',
    episodes: createSampleEpisodes('business-proposal', 12, 'Sandiwara Cinta Palsu dengan Bos Kantor'),
  },
  {
    id: 'the-glory',
    slug: 'the-glory',
    title: 'The Glory (Musim 1 & 2)',
    hangulTitle: '더 글로리',
    romanizedTitle: 'Deo Geullori',
    alternativeTitles: ['Kemuliaan Balas Dendam'],
    synopsis:
      'Moon Dong-eun, wanita yang masa mudanya hancur total akibat perundungan fisik brutal oleh geng kaya di SMA, menghabiskan belasan tahun menyusun rencana balas dendam yang sempurna. Ia menjadi wali kelas dari anak pelaku utamanya dan menjerat mereka ke dalam kehancuran hidup mereka sendiri.',
    posterUrl: '/images/poster_vincenzo.jpg',
    bannerUrl: '/images/poster_vincenzo.jpg',
    type: 'series',
    status: 'completed',
    genres: ['Melodrama', 'Thriller & Misteri'],
    releaseYear: 2022,
    network: 'Netflix',
    director: 'Ahn Gil-ho',
    cast: ['Song Hye-kyo', 'Lee Do-hyun', 'Lim Ji-yeon', 'Park Sung-hoon', 'Jung Sung-il'],
    rating: 9.6,
    views: 2900000,
    totalEpisodes: 16,
    latestEpisode: 16,
    subtitleLanguages: ['Sub Indo', 'Eng Sub'],
    createdAt: '2022-12-30',
    updatedAt: '2026-03-10',
    episodes: createSampleEpisodes('the-glory', 16, 'Balas Dendam Dingin Moon Dong-eun'),
  },
];

// Alias for compatibility
export const DONGHUA_LIST = DRAKOR_LIST;

// Weekly K-Drama broadcast schedules in WIB (UTC+7)
export const SCHEDULE_LIST: ScheduleEntry[] = [
  // Senin
  { id: 'sch-1', drakorId: 'lovely-runner', dayOfWeek: 'Senin', airTime: '18:50 WIB', episodeNumber: 15, network: 'tvN', status: 'aired' },
  { id: 'sch-2', drakorId: 'business-proposal', dayOfWeek: 'Senin', airTime: '20:00 WIB', episodeNumber: 11, network: 'SBS', status: 'aired' },
  // Selasa
  { id: 'sch-3', drakorId: 'lovely-runner', dayOfWeek: 'Selasa', airTime: '18:50 WIB', episodeNumber: 16, network: 'tvN', status: 'aired' },
  { id: 'sch-4', drakorId: 'business-proposal', dayOfWeek: 'Selasa', airTime: '20:00 WIB', episodeNumber: 12, network: 'SBS', status: 'aired' },
  // Rabu
  { id: 'sch-5', drakorId: 'moving', dayOfWeek: 'Rabu', airTime: '14:00 WIB', episodeNumber: 19, network: 'Disney+', status: 'upcoming' },
  { id: 'sch-6', drakorId: 'hospital-playlist', dayOfWeek: 'Rabu', airTime: '19:30 WIB', episodeNumber: 11, network: 'tvN', status: 'upcoming' },
  // Kamis
  { id: 'sch-7', drakorId: 'moving', dayOfWeek: 'Kamis', airTime: '14:00 WIB', episodeNumber: 20, network: 'Disney+', status: 'upcoming' },
  { id: 'sch-8', drakorId: 'hospital-playlist', dayOfWeek: 'Kamis', airTime: '19:30 WIB', episodeNumber: 12, network: 'tvN', status: 'upcoming' },
  // Jumat
  { id: 'sch-9', drakorId: 'the-judge-from-hell', dayOfWeek: 'Jumat', airTime: '20:00 WIB', episodeNumber: 13, network: 'SBS', status: 'upcoming' },
  { id: 'sch-10', drakorId: 'the-glory', dayOfWeek: 'Jumat', airTime: '21:00 WIB', episodeNumber: 15, network: 'Netflix', status: 'upcoming' },
  // Sabtu
  { id: 'sch-11', drakorId: 'the-judge-from-hell', dayOfWeek: 'Sabtu', airTime: '20:00 WIB', episodeNumber: 14, network: 'SBS', status: 'upcoming' },
  { id: 'sch-12', drakorId: 'queen-of-tears', dayOfWeek: 'Sabtu', airTime: '19:20 WIB', episodeNumber: 15, network: 'tvN', status: 'aired' },
  { id: 'sch-13', drakorId: 'love-next-door', dayOfWeek: 'Sabtu', airTime: '20:30 WIB', episodeNumber: 15, network: 'tvN', status: 'upcoming' },
  // Minggu
  { id: 'sch-14', drakorId: 'queen-of-tears', dayOfWeek: 'Minggu', airTime: '19:20 WIB', episodeNumber: 16, network: 'tvN', status: 'aired' },
  { id: 'sch-15', drakorId: 'love-next-door', dayOfWeek: 'Minggu', airTime: '20:30 WIB', episodeNumber: 16, network: 'tvN', status: 'upcoming' },
];

export const RANKINGS_DATA: Record<'daily' | 'weekly' | 'monthly' | 'all_time', RankingEntry[]> = {
  daily: [
    { id: 'rk-d-1', drakorId: 'queen-of-tears', period: 'daily', rank: 1, viewCount: 128400, score: 9.9, snapshotAt: '2026-10-31' },
    { id: 'rk-d-2', drakorId: 'lovely-runner', period: 'daily', rank: 2, viewCount: 114100, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-d-3', drakorId: 'the-judge-from-hell', period: 'daily', rank: 3, viewCount: 99800, score: 9.6, snapshotAt: '2026-10-31' },
    { id: 'rk-d-4', drakorId: 'love-next-door', period: 'daily', rank: 4, viewCount: 91200, score: 9.5, snapshotAt: '2026-10-31' },
    { id: 'rk-d-5', drakorId: 'vincenzo', period: 'daily', rank: 5, viewCount: 88900, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-d-6', drakorId: 'crash-landing-on-you', period: 'daily', rank: 6, viewCount: 75100, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-d-7', drakorId: 'moving', period: 'daily', rank: 7, viewCount: 69400, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-d-8', drakorId: 'exhuma', period: 'daily', rank: 8, viewCount: 66000, score: 9.5, snapshotAt: '2026-10-31' },
  ],
  weekly: [
    { id: 'rk-w-1', drakorId: 'queen-of-tears', period: 'weekly', rank: 1, viewCount: 780400, score: 9.9, snapshotAt: '2026-10-31' },
    { id: 'rk-w-2', drakorId: 'lovely-runner', period: 'weekly', rank: 2, viewCount: 745000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-w-3', drakorId: 'the-judge-from-hell', period: 'weekly', rank: 3, viewCount: 625000, score: 9.6, snapshotAt: '2026-10-31' },
    { id: 'rk-w-4', drakorId: 'love-next-door', period: 'weekly', rank: 4, viewCount: 584000, score: 9.5, snapshotAt: '2026-10-31' },
    { id: 'rk-w-5', drakorId: 'vincenzo', period: 'weekly', rank: 5, viewCount: 540000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-w-6', drakorId: 'moving', period: 'weekly', rank: 6, viewCount: 490000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-w-7', drakorId: 'hospital-playlist', period: 'weekly', rank: 7, viewCount: 460000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-w-8', drakorId: 'crash-landing-on-you', period: 'weekly', rank: 8, viewCount: 425000, score: 9.7, snapshotAt: '2026-10-31' },
  ],
  monthly: [
    { id: 'rk-m-1', drakorId: 'queen-of-tears', period: 'monthly', rank: 1, viewCount: 3450000, score: 9.9, snapshotAt: '2026-10-31' },
    { id: 'rk-m-2', drakorId: 'lovely-runner', period: 'monthly', rank: 2, viewCount: 3120000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-m-3', drakorId: 'crash-landing-on-you', period: 'monthly', rank: 3, viewCount: 2980000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-m-4', drakorId: 'vincenzo', period: 'monthly', rank: 4, viewCount: 2850000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-m-5', drakorId: 'moving', period: 'monthly', rank: 5, viewCount: 2650000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-m-6', drakorId: 'exhuma', period: 'monthly', rank: 6, viewCount: 2400000, score: 9.5, snapshotAt: '2026-10-31' },
    { id: 'rk-m-7', drakorId: 'the-glory', period: 'monthly', rank: 7, viewCount: 2200000, score: 9.6, snapshotAt: '2026-10-31' },
    { id: 'rk-m-8', drakorId: 'the-judge-from-hell', period: 'monthly', rank: 8, viewCount: 1620000, score: 9.5, snapshotAt: '2026-10-31' },
  ],
  all_time: [
    { id: 'rk-a-1', drakorId: 'parasite', period: 'all_time', rank: 1, viewCount: 4500000, score: 9.9, snapshotAt: '2026-10-31' },
    { id: 'rk-a-2', drakorId: 'crash-landing-on-you', period: 'all_time', rank: 2, viewCount: 4200000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-a-3', drakorId: 'queen-of-tears', period: 'all_time', rank: 3, viewCount: 3450000, score: 9.9, snapshotAt: '2026-10-31' },
    { id: 'rk-a-4', drakorId: 'lovely-runner', period: 'all_time', rank: 4, viewCount: 3120000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-a-5', drakorId: 'hospital-playlist', period: 'all_time', rank: 5, viewCount: 3100000, score: 9.8, snapshotAt: '2026-10-31' },
    { id: 'rk-a-6', drakorId: 'vincenzo', period: 'all_time', rank: 6, viewCount: 2980000, score: 9.7, snapshotAt: '2026-10-31' },
    { id: 'rk-a-7', drakorId: 'the-glory', period: 'all_time', rank: 7, viewCount: 2900000, score: 9.6, snapshotAt: '2026-10-31' },
    { id: 'rk-a-8', drakorId: 'moving', period: 'all_time', rank: 8, viewCount: 2850000, score: 9.7, snapshotAt: '2026-10-31' },
  ],
};

// Data retrieval helpers
export function getDrakorBySlug(slug: string): Drakor | undefined {
  return DRAKOR_LIST.find((d) => d.slug === slug);
}
export const getDonghuaBySlug = getDrakorBySlug;

export function getDrakorById(id: string): Drakor | undefined {
  return DRAKOR_LIST.find((d) => d.id === id);
}
export const getDonghuaById = getDrakorById;

export function getRelatedDrakor(drakor: Drakor, limit = 4): Drakor[] {
  return DRAKOR_LIST.filter(
    (d) => d.id !== drakor.id && d.genres.some((g) => drakor.genres.includes(g))
  ).slice(0, limit);
}
export const getRelatedDonghua = getRelatedDrakor;

export function getScheduleWithDrakor(): ScheduleEntry[] {
  return SCHEDULE_LIST.map((entry) => {
    const drakor = getDrakorById(entry.drakorId);
    return {
      ...entry,
      drakor,
      donghua: drakor,
      donghuaId: entry.drakorId,
    };
  });
}
export const getScheduleWithDonghua = getScheduleWithDrakor;

export function getRankingsWithDrakor(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): RankingEntry[] {
  return RANKINGS_DATA[period].map((entry) => {
    const drakor = getDrakorById(entry.drakorId);
    return {
      ...entry,
      drakor,
      donghua: drakor,
      donghuaId: entry.drakorId,
    };
  });
}
export const getRankingsWithDonghua = getRankingsWithDrakor;
