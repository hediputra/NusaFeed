import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Award, Flame, RefreshCw, X, Star, Calendar, TrendingUp, ChevronRight, Zap } from 'lucide-react';

interface AthleteProfile {
  id: string;
  name: string;
  sport: string;
  team: string;
  country: string;
  avatar: string;
  imageUrl: string;
  bio: string;
  trendingReason: string;
  stats: { label: string; value: string; suffix?: string }[];
  achievements: string[];
  recentMatches: { opponent: string; score: string; date: string; performance: string }[];
}

const INITIAL_ATHLETES: AthleteProfile[] = [
  {
    id: 'megawati',
    name: 'Megawati Hangestri',
    sport: 'Bola Voli',
    team: 'Daejeon JungKwanJang Red Sparks',
    country: 'Indonesia',
    avatar: '🏐',
    imageUrl: 'https://images.unsplash.com/photo-1592656094270-b96531980838?auto=format&fit=crop&w=600&q=80',
    bio: 'Pemain voli putri andalan Indonesia yang berposisi sebagai Opposite Spiker. Dikenal dengan julukan "Megatron" karena smash tajamnya yang mematikan di Liga Voli Korea Selatan (V-League).',
    trendingReason: 'Membawa Red Sparks memenangkan 4 laga beruntun dengan mencetak rata-rata 25 poin per pertandingan.',
    stats: [
      { label: 'Poin Musim Ini', value: '735' },
      { label: 'Tingkat Sukses Serangan', value: '46.8', suffix: '%' },
      { label: 'Poin Servis (Ace)', value: '32' },
      { label: 'Blok Sukses', value: '45' }
    ],
    achievements: [
      'MVP Putaran I Liga Voli Korea 2023/2024',
      'Medali Perunggu SEA Games (2017, 2019, 2021, 2023)',
      'Best Server Proliga Indonesia'
    ],
    recentMatches: [
      { opponent: 'Pink Spiders', score: 'Menang 3-1', date: '25 Juni 2026', performance: '28 Poin, 2 Aces' },
      { opponent: 'Hyundai Hillstate', score: 'Menang 3-2', date: '21 Juni 2026', performance: '24 Poin, 3 Blocks' },
      { opponent: 'Expressway Co.', score: 'Menang 3-0', date: '17 Juni 2026', performance: '19 Poin, 1 Ace' }
    ]
  },
  {
    id: 'arhan',
    name: 'Pratama Arhan',
    sport: 'Sepak Bola',
    team: 'Suwon FC',
    country: 'Indonesia',
    avatar: '⚽',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    bio: 'Bek kiri lincah Timnas Indonesia yang terkenal dengan lemparan ke dalam (long throw-in) super jauh layaknya tendangan sudut. Saat ini berkarir profesional di K-League 1.',
    trendingReason: 'Menyumbang assist krusial lewat skema lemparan ke dalam khas saat membela Timnas di Kualifikasi Piala Dunia.',
    stats: [
      { label: 'Total Caps Timnas', value: '48' },
      { label: 'Assist Musim Ini', value: '4' },
      { label: 'Akurasi Umpan', value: '78', suffix: '%' },
      { label: 'Intersep per Laga', value: '3.2' }
    ],
    achievements: [
      'Pemain Muda Terbaik Piala AFF 2020',
      'Medali Emas SEA Games 2023 Kamboja',
      'Runner-Up Piala AFF 2020'
    ],
    recentMatches: [
      { opponent: 'Irak (Timnas)', score: 'Kalah 1-2', date: '22 Juni 2026', performance: 'Umpan Jauh Berbuah Gol' },
      { opponent: 'Filipina (Timnas)', score: 'Menang 2-0', date: '18 Juni 2026', performance: 'Bermain Penuh, 3 Tekel Bersih' },
      { opponent: 'Jeonbuk Motors', score: 'Seri 1-1', date: '14 Juni 2026', performance: 'Masuk Menit 70\', Assist Lemparan' }
    ]
  },
  {
    id: 'bagnaia',
    name: 'Francesco Bagnaia',
    sport: 'MotoGP',
    team: 'Ducati Lenovo Team',
    country: 'Italia',
    avatar: '🏍️',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    bio: 'Juara Dunia MotoGP dua kali beruntun asal Italia. Anak didik Valentino Rossi di VR46 Academy ini terkenal dengan gaya balapnya yang super mulus namun sangat agresif saat pengereman.',
    trendingReason: 'Memenangkan balapan utama di GP Assen setelah duel sengit lap terakhir melawan Jorge Martin.',
    stats: [
      { label: 'Poin Klasemen', value: '198' },
      { label: 'Kemenangan Seri', value: '5' },
      { label: 'Pole Position', value: '3' },
      { label: 'Podium Terbanyak', value: '7' }
    ],
    achievements: [
      'Juara Dunia MotoGP (2022, 2023)',
      'Juara Dunia Moto2 (2018)',
      'Pemenang BMW M Award 2023'
    ],
    recentMatches: [
      { opponent: 'GP Belanda (Assen)', score: 'P1 (Menang)', date: '27 Juni 2026', performance: 'Memimpin sejak Lap 10' },
      { opponent: 'GP Italia (Mugello)', score: 'P1 (Menang)', date: '15 Juni 2026', performance: 'Laju Sempurna di Kandang' },
      { opponent: 'GP Catalan', score: 'P2', date: '01 Juni 2026', performance: 'Duel Sengit vs Martin' }
    ]
  },
  {
    id: 'sinner',
    name: 'Jannik Sinner',
    sport: 'Tenis',
    team: 'ATP Tour Professional',
    country: 'Italia',
    avatar: '🎾',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
    bio: 'Petenis peringkat 1 dunia ATP termuda asal Italia. Sinner memiliki groundstroke dua tangan yang sangat kuat dari garis belakang lapangan dan ketahanan fisik luar biasa.',
    trendingReason: 'Mencapai semifinal turnamen Wimbledon tanpa kehilangan satu set pun di laga perempat final.',
    stats: [
      { label: 'Peringkat Dunia', value: '#1' },
      { label: 'Rasio Menang-Kalah', value: '38-3' },
      { label: 'Gelar Juara 2026', value: '4' },
      { label: 'Aces Disajikan', value: '290' }
    ],
    achievements: [
      'Juara Australian Open 2024',
      'Juara Davis Cup 2023 (Tim Italia)',
      'Juara ATP Masters 1000 Miami Open'
    ],
    recentMatches: [
      { opponent: 'Carlos Alcaraz', score: 'Menang 3-0', date: '26 Juni 2026', performance: 'Dominasi Forehand Menyilang' },
      { opponent: 'Daniil Medvedev', score: 'Menang 3-1', date: '23 Juni 2026', performance: 'Akurasi Servis Pertama 82%' },
      { opponent: 'Grigor Dimitrov', score: 'Menang 3-0', date: '20 Juni 2026', performance: 'Pertahanan Luar Biasa' }
    ]
  }
];

export default function TrendingAthletes() {
  const [athletes, setAthletes] = useState<AthleteProfile[]>(INITIAL_ATHLETES);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSyncStats = () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    // Simulated API Call to SportsDB / SofaScore endpoints
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);

      // Mutate one of the athletes to prove fresh live statistics integration
      setAthletes((prev) => 
        prev.map((ath) => {
          if (ath.id === 'megawati') {
            return {
              ...ath,
              trendingReason: 'Dinobatkan sebagai Atlet Terpopuler K-League Asia Pacific pekan ini!',
              stats: [
                { label: 'Poin Musim Ini', value: '752' }, // increased
                { label: 'Tingkat Sukses Serangan', value: '47.2', suffix: '%' }, // improved
                { label: 'Poin Servis (Ace)', value: '34' },
                { label: 'Blok Sukses', value: '47' }
              ]
            };
          }
          if (ath.id === 'bagnaia') {
            return {
              ...ath,
              stats: [
                { label: 'Poin Klasemen', value: '223' }, // updated after Assen
                { label: 'Kemenangan Seri', value: '6' },
                { label: 'Pole Position', value: '4' },
                { label: 'Podium Terbanyak', value: '8' }
              ]
            };
          }
          return ath;
        })
      );

      setTimeout(() => {
        setSyncSuccess(false);
      }, 3500);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-gray-850 dark:bg-gray-950 shadow-sm transition-all duration-300">
      {/* Header section with Sync action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-gray-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md shadow-rose-500/10">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
              <span>Atlet Sedang Naik Daun</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="text-3xs sm:text-2xs text-slate-400 dark:text-gray-500">
              Profil, rekam statistik, dan sorotan performa atlet terpopuler minggu ini
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncStats}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-2xs font-extrabold cursor-pointer transition-all ${
            syncSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850'
          }`}
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-amber-500' : 'text-slate-500'}`} />
          <span>{isSyncing ? 'Mengsinkronkan API...' : syncSuccess ? 'Statistik Terupdate!' : 'Sinkronkan Profil'}</span>
        </button>
      </div>

      {/* Grid List of Athletes (Bento grid style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {athletes.map((athlete) => (
          <motion.div
            key={athlete.id}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setSelectedAthlete(athlete)}
            className="group relative overflow-hidden rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-gray-900 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-950 hover:border-amber-500/30 dark:hover:border-amber-400/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xl sm:text-2xl" role="img" aria-label={athlete.sport}>
                  {athlete.avatar}
                </span>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-gray-850 dark:text-gray-400 uppercase tracking-wide">
                  {athlete.sport}
                </span>
              </div>

              <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {athlete.name}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mb-2.5">
                {athlete.team}
              </p>

              <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/10 p-2.5 border border-amber-500/10 mb-3">
                <div className="flex items-center gap-1 mb-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Sorotan Pekan Ini</span>
                </div>
                <p className="text-3xs sm:text-2xs text-slate-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {athlete.trendingReason}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-gray-900 text-3xs sm:text-2xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Lihat Detail & Statistik</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Detail view */}
      <AnimatePresence>
        {selectedAthlete && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-850 overflow-hidden"
            >
              {/* Image banner & Title overlay */}
              <div className="relative h-44 sm:h-52 bg-slate-900">
                <img
                  src={selectedAthlete.imageUrl}
                  alt={selectedAthlete.name}
                  className="w-full h-full object-cover opacity-45 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                
                {/* Header text */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{selectedAthlete.avatar}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {selectedAthlete.sport}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      📍 {selectedAthlete.country}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-2xl tracking-tight">
                    {selectedAthlete.name}
                  </h3>
                  <p className="text-2xs sm:text-xs text-slate-300/90 font-medium">
                    {selectedAthlete.team}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-750 cursor-pointer transition-all"
                  title="Tutup"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Bio & Stats Scrollable section */}
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5 select-none">
                {/* Profile bio */}
                <div>
                  <h4 className="text-2xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Profil Singkat</h4>
                  <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    {selectedAthlete.bio}
                  </p>
                </div>

                {/* Grid of Statistics */}
                <div>
                  <h4 className="text-2xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">Statistik Live API</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedAthlete.stats.map((stat, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-150 dark:border-gray-850 p-3 text-center">
                        <p className="text-4xs sm:text-3xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-snug">
                          {stat.label}
                        </p>
                        <p className="font-mono text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                          {stat.value}{stat.suffix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two Columns: Achievements & Recent Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* Achievements */}
                  <div className="space-y-2.5">
                    <h4 className="text-2xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider">Prestasi Utama</h4>
                    <div className="space-y-1.5">
                      {selectedAthlete.achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-gray-300">
                          <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Match Form */}
                  <div className="space-y-2.5">
                    <h4 className="text-2xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Pertandingan Terakhir</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedAthlete.recentMatches.map((m, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 dark:border-gray-900 p-2 text-2xs space-y-1 bg-slate-50/40 dark:bg-gray-900/20">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800 dark:text-gray-200">vs {m.opponent}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{m.score}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 dark:text-gray-500 text-[10px]">
                            <span>{m.date}</span>
                            <span className="italic text-slate-500 dark:text-gray-400 font-medium">{m.performance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="bg-slate-50 dark:bg-gray-900 px-5 py-3.5 border-t border-slate-100 dark:border-gray-900 flex items-center justify-between text-2xs">
                <span className="text-slate-400 dark:text-gray-500 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                  <span>Powered by SofaScore & SportsDB Live APIs</span>
                </span>
                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-2xs cursor-pointer transition-all"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
