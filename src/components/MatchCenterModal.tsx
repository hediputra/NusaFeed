import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Activity, Sparkles, Clock, Zap, BarChart3, Users, Play, Tv, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MatchSchedule {
  id: string;
  sport: 'bola' | 'motogp' | 'f1' | 'tenis' | 'futsal' | 'bulutangkis' | 'basket';
  league: string;
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  competitors?: string;
  time: string;
  date: string;
  status: 'live' | 'upcoming' | 'finished';
  tvChannel: string;
  score?: string;
  round?: string;
}

interface MatchCenterModalProps {
  match: MatchSchedule | null;
  onClose: () => void;
}

// Custom rich statistics & events data generator based on selected sport type
interface SportStats {
  possession?: { home: number; away: number; label: string };
  metrics: { label: string; home: string | number; away: string | number; percentage?: boolean }[];
  players: { name: string; role: string; rating: number; action?: string; logo: string; isHome: boolean }[];
  timeline: { time: string; icon: string; title: string; desc: string; type: 'positive' | 'negative' | 'neutral' }[];
}

export default function MatchCenterModal({ match, onClose }: MatchCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'lineups' | 'events'>('stats');
  const [currentScore, setCurrentScore] = useState<string>('');

  useEffect(() => {
    if (match) {
      setCurrentScore(match.score || 'VS');
      // Set default tab
      setActiveTab('stats');
    }
  }, [match]);

  if (!match) return null;

  // Generate mock details depending on the match ID/sport
  const getMatchCenterData = (): SportStats => {
    switch (match.sport) {
      case 'bola':
      case 'futsal':
        return {
          possession: { home: 56, away: 44, label: 'Penguasaan Bola' },
          metrics: [
            { label: 'Total Tembakan', home: 14, away: 9 },
            { label: 'Tembakan Tepat Sasaran', home: 6, away: 3 },
            { label: 'Pelanggaran', home: 11, away: 13 },
            { label: 'Kartu Kuning', home: 1, away: 3 },
            { label: 'Kartu Merah', home: 0, away: 0 },
            { label: 'Tendangan Sudut', home: 7, away: 4 },
            { label: 'Akurasi Operan', home: 84, away: 78, percentage: true },
          ],
          players: [
            { name: match.homeTeam === 'Persib Bandung' ? 'David da Silva' : 'Ciro Alves', role: 'Penyerang Utama', rating: 8.8, action: '⚽ Gol (78\')', logo: match.homeLogo || 'HME', isHome: true },
            { name: 'Marc Klok', role: 'Gelandang Tengah', rating: 8.2, action: '🎯 1 Assist', logo: match.homeLogo || 'HME', isHome: true },
            { name: match.awayTeam === 'Persija Jakarta' ? 'Ryo Matsumura' : 'Gustavo Almeida', role: 'Pemain Sayap', rating: 7.4, action: '1 Tembakan Bebas', logo: match.awayLogo || 'AWY', isHome: false },
            { name: 'Ondrej Kudela', role: 'Bek Tengah', rating: 6.8, action: '🟨 Kartu Kuning (24\')', logo: match.awayLogo || 'AWY', isHome: false },
          ],
          timeline: [
            { time: "0'", icon: "🏁", title: "Pertandingan Dimulai", desc: "Kick-off babak pertama ditiup oleh wasit.", type: "neutral" },
            { time: "24'", icon: "🟨", title: "Kartu Kuning - Persija", desc: "Pelanggaran keras Ondrej Kudela terhadap David da Silva.", type: "negative" },
            { time: "45'", icon: "⏱️", title: "Turun Minum", desc: "Babak pertama selesai dengan skor sementara 0-0.", type: "neutral" },
            { time: "52'", icon: "⚽", title: "GOAL! Persib Bandung", desc: "Ciro Alves mencetak gol pembuka lewat sepakan melengkung indah! Assist oleh Marc Klok.", type: "positive" },
            { time: "78'", icon: "⚽", title: "GOAL! Persib Bandung", desc: "David da Silva memperlebar keunggulan 2-0 memanfaatkan blunder lini belakang lawan.", type: "positive" },
            { time: "85'", icon: "🔄", title: "Pergantian Pemain", desc: "Beckham Putra masuk menggantikan Beckham Putra untuk penyegaran taktik.", type: "neutral" },
            { time: "90+3'", icon: "🎉", title: "Selesai", desc: "Persib Bandung amankan kemenangan krusial 2-0 di laga el-classico ini!", type: "positive" }
          ]
        };
      case 'bulutangkis':
        return {
          metrics: [
            { label: 'Poin Smash Sukses', home: 24, away: 18 },
            { label: 'Serangan Netting', home: 14, away: 10 },
            { label: 'Kesalahan Sendiri (Unforced Errors)', home: 8, away: 14 },
            { label: 'Rally Terpanjang (Pukulan)', home: 38, away: 38 },
            { label: 'Kecepatan Smash Maksimal', home: '412 km/h', away: '398 km/h' },
            { label: 'Servis Menghasilkan Poin', home: 6, away: 4 },
          ],
          players: [
            { name: 'Fajar Alfian', role: 'Pemain Depan', rating: 8.5, action: 'Smash Dominan', logo: match.homeLogo || 'IDN', isHome: true },
            { name: 'Muhammad Rian Ardianto', role: 'Pemain Belakang', rating: 8.3, action: 'Defensif Tangguh', logo: match.homeLogo || 'IDN', isHome: true },
            { name: 'Liang Wei Keng', role: 'Smasher Utama', rating: 7.6, action: '14 Smash Kill', logo: match.awayLogo || 'CHN', isHome: false },
            { name: 'Wang Chang', role: 'Placer Netting', rating: 7.5, action: 'Umpan Menyilang', logo: match.awayLogo || 'CHN', isHome: false },
          ],
          timeline: [
            { time: "Set 1", icon: "🏸", title: "Set Pertama Dimulai", desc: "Pertandingan ketat sejak poin pertama bergulir.", type: "neutral" },
            { time: "11-9", icon: "⏱️", title: "Interval Game 1", desc: "Fajar/Rian unggul tipis saat break teknis pertama.", type: "positive" },
            { time: "21-19", icon: "🏆", title: "Set 1 Dimenangkan Fajar/Rian", desc: "Smash lurus keras Rian menutup game pertama dengan kemenangan dramatis.", type: "positive" },
            { time: "Set 2", icon: "🏸", title: "Set Kedua Berlanjut", desc: "Ganda China merespons dengan tempo serangan cepat.", type: "negative" },
            { time: "11-8", icon: "⏱️", title: "Interval Game 2", desc: "Ganda putra China mengamankan keunggulan interval kedua.", type: "negative" },
            { time: "15-17", icon: "🔥", title: "Rally Sengit 38 Pukulan", desc: "Fajar Alfian memenangkan poin krusial lewat netting tipis yang tak terjangkau.", type: "positive" }
          ]
        };
      case 'motogp':
      case 'f1':
        return {
          metrics: [
            { label: 'Kecepatan Tertinggi (Top Speed)', home: '354.2 km/h', away: '352.8 km/h' },
            { label: 'Waktu Sektor 1 Terbaik', home: '21.045s', away: '21.082s' },
            { label: 'Waktu Sektor 4 Terbaik', home: '23.140s', away: '23.310s' },
            { label: 'Pilihan Ban Depan', home: 'Hard (Slick)', away: 'Hard (Slick)' },
            { label: 'Pilihan Ban Belakang', home: 'Medium (Slick)', away: 'Medium (Slick)' },
            { label: 'Waktu Pit Stop Rata-rata', home: 'N/A (MotoGP)', away: 'N/A' },
          ],
          players: [
            { name: 'Francesco Bagnaia', role: 'Ducati Lenovo Team', rating: 9.6, action: 'Leader / P1', logo: 'ITA', isHome: true },
            { name: 'Enea Bastianini', role: 'Ducati Lenovo Team', rating: 8.5, action: 'P3 / Podium', logo: 'ITA', isHome: true },
            { name: 'Jorge Martin', role: 'Prima Pramac Racing', rating: 9.0, action: 'Chaser / P2 (+0.145s)', logo: 'SPA', isHome: false },
            { name: 'Marc Marquez', role: 'Gresini Racing', rating: 8.2, action: 'P4', logo: 'SPA', isHome: false },
          ],
          timeline: [
            { time: "Lap 1", icon: "🏁", title: "Lampu Hijau / Start", desc: "Bagnaia mengambil holeshot memimpin tikungan pertama Assen.", type: "positive" },
            { time: "Lap 5", icon: "🏍️", title: "Jorge Martin Tercepat", desc: "Martin mencetak fastest lap baru 1:31.908s mendekati Bagnaia.", type: "negative" },
            { time: "Lap 10", icon: "⚠️", title: "Crash - Alex Marquez", desc: "Rider terjatuh di Tikungan 7, Marshal mengibarkan bendera kuning sisa sektor.", type: "neutral" },
            { time: "Lap 18", icon: "🔥", title: "Duel Sengit P1-P2", desc: "Jarak Bagnaia dan Martin memangkas tipis menjadi hanya (+0.142s)!", type: "positive" },
            { time: "Lap 22", icon: "⚡", title: "Pertahanan Sempurna", desc: "Bagnaia mencetak rekor sektor 3 untuk memblokir celah serangan Martin.", type: "positive" }
          ]
        };
      case 'basket':
        return {
          possession: { home: 52, away: 48, label: 'Persentase Efisiensi Penyerangan' },
          metrics: [
            { label: 'Akurasi Tembakan (FG%)', home: '48.2%', away: '42.9%' },
            { label: 'Akurasi Tembakan 3 Poin', home: '38.5%', away: '31.2%' },
            { label: 'Tembakan Gratis (FT%)', home: '82%', away: '75%', percentage: true },
            { label: 'Total Rebound', home: 42, away: 38 },
            { label: 'Assist', home: 21, away: 16 },
            { label: 'Turnovers', home: 10, away: 14 },
            { label: 'Blok Tembakan', home: 6, away: 4 },
          ],
          players: [
            { name: 'Abraham Damar Grahita', role: 'Shooting Guard', rating: 8.9, action: '22 Poin, 4 Rebound', logo: 'SMP', isHome: true },
            { name: 'Arki Dikania Wisnu', role: 'Small Forward', rating: 8.0, action: '8 Poin, 7 Assist', logo: 'SMP', isHome: true },
            { name: 'Brandone Francis', role: 'Power Forward', rating: 8.4, action: '19 Poin, 9 Rebound', logo: 'PRB', isHome: false },
            { name: 'Yudha Saputera', role: 'Point Guard', rating: 7.6, action: '11 Poin, 5 Assist', logo: 'PRB', isHome: false },
          ],
          timeline: [
            { time: "Q1", icon: "🏀", title: "Kuarter Pertama Selesai", desc: "Satria Muda memimpin kuarter awal dengan skor ketat 22-18.", type: "positive" },
            { time: "Q2", icon: "🎯", title: "Lemparan 3 Angka Beruntun", desc: "Yudha Saputera menyamakan kedudukan lewat tembakan perimeter jauh.", type: "negative" },
            { time: "Q2 45'", icon: "⏱️", title: "Half Time", desc: "Satria Muda mengamankan skor sementara 42-38 menuju ruang ganti.", type: "neutral" },
            { time: "Q3", icon: "💪", title: "Dunk Spektakuler", desc: "Brandone Francis melakukan slam dunk bertenaga melewati defense rapat.", type: "negative" },
            { time: "Q4", icon: "🔥", title: "Clutch Free-Throws", desc: "Abraham mengamankan 4 lemparan bebas berturut-turut di menit akhir laga.", type: "positive" }
          ]
        };
      default:
        return {
          metrics: [
            { label: 'Poin Kemenangan', home: 'Aktif', away: 'Aktif' },
            { label: 'Akurasi Kinerja', home: '92%', away: '90%' },
            { label: 'Fouls / Pelanggaran', home: 4, away: 6 },
          ],
          players: [
            { name: match.homeTeam || 'Tim Tuan Rumah', role: 'Utama', rating: 8.5, logo: match.homeLogo || 'HME', isHome: true },
            { name: match.awayTeam || 'Tim Tamu', role: 'Utama', rating: 8.0, logo: match.awayLogo || 'AWY', isHome: false },
          ],
          timeline: [
            { time: "Start", icon: "🏁", title: "Laga Dimulai", desc: "Kedua pihak siap berlaga dengan determinasi tinggi.", type: "neutral" },
            { time: "Live", icon: "⚡", title: "Skor Diperbarui", desc: "Statistik pertandingan diumpan otomatis dari live feed API.", type: "positive" },
            { time: "Selesai", icon: "🏆", title: "Hasil Akhir Tercatat", desc: "Hasil akhir disahkan oleh tim wasit turnamen resmi.", type: "neutral" }
          ]
        };
    }
  };

  const data = getMatchCenterData();
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-850 overflow-hidden"
      >
        {/* Match center banner background styling */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
          
          {/* Header Row */}
          <div className="relative flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/10 border border-indigo-400/25 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {match.league}
              </span>
              {isLive ? (
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-white rounded-full" />
                  <span>LIVE MATCH</span>
                </span>
              ) : isFinished ? (
                <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded">
                  FINISHED
                </span>
              ) : (
                <span className="bg-indigo-600/30 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded">
                  BELUM DIMULAI
                </span>
              )}
            </div>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer transition-colors"
              title="Tutup Match Center"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Versus Header Layout */}
          <div className="relative flex items-center justify-between gap-4 py-2">
            {match.competitors ? (
              <div className="text-center w-full">
                <p className="font-mono text-3xs font-extrabold uppercase text-indigo-400 tracking-widest mb-1">
                  {match.round || 'KONTENDER'}
                </p>
                <h3 className="font-display font-black text-base sm:text-xl text-white tracking-tight">
                  {match.competitors}
                </h3>
                {match.score && (
                  <div className="mt-3.5 inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-mono font-black text-amber-400">
                    🏁 {match.score}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1 text-center min-w-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg text-xs font-black text-indigo-300 tracking-tighter mb-2.5">
                    {match.homeLogo}
                  </div>
                  <h4 className="font-display font-black text-2xs sm:text-sm text-white truncate w-full">
                    {match.homeTeam}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Tuan Rumah</span>
                </div>

                {/* Scores middle block */}
                <div className="flex flex-col items-center px-4 shrink-0">
                  <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest mb-1.5">
                    {match.round || 'SKOR'}
                  </span>
                  <div className="font-mono text-2xl sm:text-4xl font-black tracking-widest text-white drop-shadow-md">
                    {isFinished || isLive ? currentScore : 'VS'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2.5 flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    <span>{match.time}</span>
                  </p>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1 text-center min-w-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg text-xs font-black text-indigo-300 tracking-tighter mb-2.5">
                    {match.awayLogo}
                  </div>
                  <h4 className="font-display font-black text-2xs sm:text-sm text-white truncate w-full">
                    {match.awayTeam}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Tamu</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-gray-900 bg-slate-50/70 dark:bg-gray-900/30 p-1 select-none">
          {[
            { id: 'stats', label: 'Statistik Live', icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: 'lineups', label: 'Pemain Kunci', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'events', label: 'Garis Waktu', icon: <Activity className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-2xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black border border-slate-100 dark:border-gray-800'
                  : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Main Information Panel */}
        <div className="p-5 sm:p-6 max-h-[50vh] overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'stats' && (
              <motion.div
                key="stats-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* 1. Possession Bar if applicable */}
                {data.possession && (
                  <div className="space-y-1.5 pb-2">
                    <div className="flex justify-between text-2xs font-bold text-slate-700 dark:text-gray-300">
                      <span>{data.possession.home}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{data.possession.label}</span>
                      <span>{data.possession.away}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-500" style={{ width: `${data.possession.home}%` }} />
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${data.possession.away}%` }} />
                    </div>
                  </div>
                )}

                {/* 2. Numeric Metrics */}
                <div className="space-y-3.5">
                  {data.metrics.map((metric, i) => {
                    const hVal = parseFloat(String(metric.home)) || 0;
                    const aVal = parseFloat(String(metric.away)) || 0;
                    const total = hVal + aVal || 1;
                    const hPercent = (hVal / total) * 100;

                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-2xs font-medium text-slate-800 dark:text-gray-200">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{metric.home}</span>
                          <span className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wide">{metric.label}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{metric.away}</span>
                        </div>
                        
                        {/* Progressive horizontal comparative bar */}
                        {!String(metric.home).includes('km') && !String(metric.home).includes('/') && (
                          <div className="h-1 w-full bg-slate-100 dark:bg-gray-900/50 rounded-full overflow-hidden flex gap-0.5">
                            <div 
                              className="bg-indigo-500/80 dark:bg-indigo-400/80 h-full rounded-l" 
                              style={{ width: `${hPercent}%` }} 
                            />
                            <div 
                              className="bg-amber-400/80 dark:bg-amber-300/80 h-full rounded-r" 
                              style={{ width: `${100 - hPercent}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'lineups' && (
              <motion.div
                key="lineups-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Team Key Players */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-indigo-500/10 pb-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>{match.homeTeam || 'Tuan Rumah'}</span>
                    </h5>
                    {data.players.filter(p => p.isHome).map((player, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-150 dark:border-gray-900 p-3 bg-slate-50/50 dark:bg-gray-900/10 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 font-mono font-bold text-2xs text-indigo-600 dark:text-indigo-400">
                            {player.logo}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-2xs text-slate-800 dark:text-gray-200 truncate">
                              {player.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold truncate leading-none">
                              {player.role}
                            </p>
                            {player.action && (
                              <span className="inline-block text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">
                                {player.action}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30 text-2xs font-mono font-black px-2 py-1 rounded">
                          ★ {player.rating.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Away Team Key Players */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>{match.awayTeam || 'Tim Tamu'}</span>
                    </h5>
                    {data.players.filter(p => !p.isHome).map((player, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-150 dark:border-gray-900 p-3 bg-slate-50/50 dark:bg-gray-900/10 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 font-mono font-bold text-2xs text-amber-600 dark:text-amber-400">
                            {player.logo}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-2xs text-slate-800 dark:text-gray-200 truncate">
                              {player.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold truncate leading-none">
                              {player.role}
                            </p>
                            {player.action && (
                              <span className="inline-block text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">
                                {player.action}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30 text-2xs font-mono font-black px-2 py-1 rounded">
                          ★ {player.rating.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="relative pl-4 space-y-4 border-l border-slate-100 dark:border-gray-900 ml-2"
              >
                {data.timeline.map((event, idx) => {
                  let circleBg = 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-gray-900 dark:text-gray-400';
                  if (event.type === 'positive') {
                    circleBg = 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
                  } else if (event.type === 'negative') {
                    circleBg = 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30';
                  }

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Event point marker */}
                      <span className={`absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full border text-xs shadow-xs ${circleBg}`}>
                        <span className="text-[10px]">{event.icon}</span>
                      </span>

                      {/* Content block */}
                      <div className="flex-1 min-w-0 bg-slate-50/40 dark:bg-gray-900/10 rounded-xl p-3 border border-slate-100 dark:border-gray-900">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                            {event.time}
                          </span>
                          <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest">
                            EVENT RECORDED
                          </span>
                        </div>
                        <h6 className="font-display font-extrabold text-2xs text-slate-900 dark:text-white">
                          {event.title}
                        </h6>
                        <p className="text-3xs sm:text-2xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bottom Row footer */}
        <div className="bg-slate-50 dark:bg-gray-900/60 px-5 py-4 border-t border-slate-100 dark:border-gray-950 flex flex-col sm:flex-row items-center justify-between gap-3.5 text-2xs text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Tv className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Hak Siar Resmi: <strong>{match.tvChannel}</strong> (Saksikan Live HD)</span>
          </div>

          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                <span>MEMUTAR STREAMING</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-2xs cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
