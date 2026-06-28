import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, Clock, Tv, Search, Trophy, Flame, Play, CheckCircle2, ChevronRight, Activity, RefreshCw, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MatchCenterModal from './MatchCenterModal.tsx';

interface MatchSchedule {
  id: string;
  sport: 'bola' | 'motogp' | 'f1' | 'tenis' | 'futsal' | 'bulutangkis' | 'basket';
  league: string;
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  competitors?: string; // For motorsport or individual sports
  time: string; // e.g., '21:00 WIB'
  date: string; // 'Hari Ini', 'Besok', '29 Jun', '30 Jun' etc.
  status: 'live' | 'upcoming' | 'finished';
  tvChannel: string;
  score?: string; // e.g., '2 - 1' or lap times
  round?: string;
}

const SCHEDULE_DATA: MatchSchedule[] = [
  // Sepak Bola
  {
    id: 'b1',
    sport: 'bola',
    league: 'Premier League Inggris',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester United',
    homeLogo: 'LIV',
    awayLogo: 'MUN',
    time: '22:30 WIB',
    date: 'Hari Ini',
    status: 'upcoming',
    tvChannel: 'Vidio / SCTV',
    round: 'Pekan 38',
  },
  {
    id: 'b2',
    sport: 'bola',
    league: 'Liga 1 Indonesia',
    homeTeam: 'Persib Bandung',
    awayTeam: 'Persija Jakarta',
    homeLogo: 'PSB',
    awayLogo: 'PSJ',
    time: '19:00 WIB',
    date: 'Hari Ini',
    status: 'live',
    tvChannel: 'Indosiar / Vidio',
    score: '1 - 0',
    round: 'Pekan 24',
  },
  {
    id: 'b3',
    sport: 'bola',
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    homeLogo: 'RMA',
    awayLogo: 'MCI',
    time: '02:00 WIB',
    date: 'Besok',
    status: 'upcoming',
    tvChannel: 'SCTV / Vidio',
    round: 'Semifinal Leg 2',
  },
  {
    id: 'b4',
    sport: 'bola',
    league: 'Serie A Italia',
    homeTeam: 'AC Milan',
    awayTeam: 'Inter Milan',
    homeLogo: 'ACM',
    awayLogo: 'INT',
    time: '18:30 WIB',
    date: 'Kemarin',
    status: 'finished',
    score: '1 - 2',
    tvChannel: 'BeIN Sports',
    round: 'Selesai',
  },
  
  // MotoGP
  {
    id: 'm1',
    sport: 'motogp',
    league: 'MotoGP Assen, Belanda',
    competitors: 'Race Utama - Bagnaia vs Martin vs Marquez',
    time: '19:00 WIB',
    date: 'Hari Ini',
    status: 'live',
    tvChannel: 'Trans7 / SPOTV',
    round: 'Lap 18/26',
    score: 'Bagnaia memimpin (+0.320s)',
  },
  {
    id: 'm2',
    sport: 'motogp',
    league: 'MotoGP Sachsenring, Jerman',
    competitors: 'Kualifikasi & Sprint Race',
    time: '17:30 WIB',
    date: '30 Juni 2026',
    status: 'upcoming',
    tvChannel: 'Trans7 / SPOTV',
    round: 'Seri 9',
  },

  // F1
  {
    id: 'f1_1',
    sport: 'f1',
    league: 'F1 GP Silverstone, Inggris',
    competitors: 'Race Utama - Verstappen vs Hamilton vs Norris',
    time: '21:00 WIB',
    date: 'Besok',
    status: 'upcoming',
    tvChannel: 'BeIN Sports / F1 TV',
    round: 'Seri 11',
  },
  {
    id: 'f1_2',
    sport: 'f1',
    league: 'F1 GP Spielberg, Austria',
    competitors: 'Sprint Shootout & Race',
    time: '20:00 WIB',
    date: 'Kemarin',
    status: 'finished',
    score: 'Verstappen P1, Norris P2',
    tvChannel: 'BeIN Sports',
    round: 'Selesai',
  },

  // Tenis
  {
    id: 't1',
    sport: 'tenis',
    league: 'Wimbledon Grand Slam',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Jannik Sinner',
    homeLogo: 'ESP',
    awayLogo: 'ITA',
    time: '20:00 WIB',
    date: 'Besok',
    status: 'upcoming',
    tvChannel: 'SPOTV',
    round: 'Babak Final',
  },
  {
    id: 't2',
    sport: 'tenis',
    league: 'Wimbledon Wanita',
    homeTeam: 'Iga Swiatek',
    awayTeam: 'Aryna Sabalenka',
    homeLogo: 'POL',
    awayLogo: 'BLR',
    time: '20:00 WIB',
    date: 'Hari Ini',
    status: 'upcoming',
    tvChannel: 'SPOTV',
    round: 'Semifinal',
  },

  // Futsal
  {
    id: 'u1',
    sport: 'futsal',
    league: 'Pro Futsal League Indonesia',
    homeTeam: 'Bintang Timur Surabaya',
    awayTeam: 'Black Steel Papua',
    homeLogo: 'BTS',
    awayLogo: 'BSP',
    time: '14:00 WIB',
    date: 'Hari Ini',
    status: 'finished',
    score: '4 - 3',
    tvChannel: 'MNCTV / RCTI+',
    round: 'Selesai',
  },
  {
    id: 'u2',
    sport: 'futsal',
    league: 'Piala Asia Futsal AFC',
    homeTeam: 'Indonesia',
    awayTeam: 'Thailand',
    homeLogo: 'IDN',
    awayLogo: 'THA',
    time: '16:00 WIB',
    date: 'Besok',
    status: 'upcoming',
    tvChannel: 'RCTI / Vision+',
    round: 'Fase Grup',
  },

  // Bulutangkis
  {
    id: 'bd1',
    sport: 'bulutangkis',
    league: 'Indonesia Open Super 1000',
    homeTeam: 'Jonatan Christie',
    awayTeam: 'Viktor Axelsen',
    homeLogo: 'IDN',
    awayLogo: 'DEN',
    time: '15:00 WIB',
    date: 'Hari Ini',
    status: 'finished',
    score: '21-18, 14-21, 21-19',
    tvChannel: 'MNCTV / SPOTV',
    round: 'Final MS',
  },
  {
    id: 'bd2',
    sport: 'bulutangkis',
    league: 'Indonesia Open Super 1000',
    homeTeam: 'Fajar/Rian',
    awayTeam: 'Liang/Wang',
    homeLogo: 'IDN',
    awayLogo: 'CHN',
    time: '16:30 WIB',
    date: 'Hari Ini',
    status: 'live',
    score: '21-19, 11-15',
    tvChannel: 'MNCTV / SPOTV',
    round: 'Final MD (Set 2)',
  },

  // Basket
  {
    id: 'bk1',
    sport: 'basket',
    league: 'IBL Indonesia Tokopedia',
    homeTeam: 'Satria Muda Pertamina',
    awayTeam: 'Prawira Bandung',
    homeLogo: 'SMP',
    awayLogo: 'PRB',
    time: '18:00 WIB',
    date: 'Besok',
    status: 'upcoming',
    tvChannel: 'Vidio / IBL TV',
    round: 'Semifinal Game 1',
  }
];

const SPORT_OPTIONS = [
  { id: 'all', name: 'Semua Jadwal', icon: '🏆' },
  { id: 'bola', name: 'Sepak Bola', icon: '⚽' },
  { id: 'motogp', name: 'MotoGP', icon: '🏍️' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'tenis', name: 'Tenis', icon: '🎾' },
  { id: 'futsal', name: 'Futsal', icon: '👟' },
  { id: 'bulutangkis', name: 'Bulutangkis', icon: '🏸' },
  { id: 'basket', name: 'Basket', icon: '🏀' },
];

export default function SportsSchedule() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic schedules and synchronization states
  const [schedules, setSchedules] = useState<MatchSchedule[]>(SCHEDULE_DATA);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState<number>(30);
  const [selectedMatch, setSelectedMatch] = useState<MatchSchedule | null>(null);

  const fetchSchedules = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsSyncing(true);
    }
    setSyncError(null);
    try {
      const response = await fetch('/api/sports-schedule');
      if (!response.ok) {
        throw new Error('Gagal terhubung ke API Olahraga Publik');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        setLastSyncedAt(timeString);
      } else {
        throw new Error('Format data jadwal dari server tidak valid.');
      }
    } catch (err: any) {
      console.error('Sports API Sync error:', err);
      setSyncError(err.message || 'Gagal menyinkronkan jadwal.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial Fetch on Mount
  useEffect(() => {
    fetchSchedules(true);
  }, [fetchSchedules]);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const interval = setInterval(() => {
      fetchSchedules(true);
    }, syncIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncIntervalSeconds, fetchSchedules]);

  // Filtering schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const matchesSport = selectedSport === 'all' || item.sport === selectedSport;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        searchLower === '' ||
        item.league.toLowerCase().includes(searchLower) ||
        (item.homeTeam && item.homeTeam.toLowerCase().includes(searchLower)) ||
        (item.awayTeam && item.awayTeam.toLowerCase().includes(searchLower)) ||
        (item.competitors && item.competitors.toLowerCase().includes(searchLower));

      return matchesSport && matchesStatus && matchesSearch;
    });
  }, [schedules, selectedSport, selectedStatus, searchQuery]);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-gray-850 dark:bg-gray-950 shadow-sm overflow-hidden">
      {/* Title Header with live sync indicators */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-gray-900">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md shadow-orange-500/10 shrink-0">
            <Trophy className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2 uppercase tracking-wide">
              <span>Pusat Jadwal & Skor Olahraga</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                <span>Live API</span>
              </span>
            </h2>
            <p className="text-3xs sm:text-2xs text-slate-400 dark:text-gray-500 mt-0.5">
              Jadwal pertandingan terlengkap, diperbarui secara otomatis tanpa input manual
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap items-center gap-3.5 self-start xl:self-auto">
          {/* Sync status detail */}
          <div className="flex flex-col items-start sm:items-end sm:text-right">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${autoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              {autoSyncEnabled ? `Auto-Sinkron: Aktif (${syncIntervalSeconds}s)` : 'Auto-Sinkron: Nonaktif'}
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-gray-500 mt-0.5">
              {lastSyncedAt ? `Terakhir diperbarui: ${lastSyncedAt}` : 'Belum sinkron'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200/50 dark:border-gray-850">
            {/* Toggle Switch */}
            <button
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all ${
                autoSyncEnabled
                  ? 'bg-emerald-500 text-white shadow-xs font-black'
                  : 'bg-white dark:bg-gray-800 text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 border border-slate-200/20 dark:border-gray-700/20'
              }`}
            >
              Auto {autoSyncEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Manual Sync Trigger */}
            <button
              onClick={() => fetchSchedules(false)}
              disabled={isSyncing}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all ${
                isSyncing
                  ? 'bg-slate-200/50 dark:bg-gray-800 text-slate-400'
                  : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-gray-750 shadow-xs border border-slate-200/25 dark:border-gray-700/50'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
              <span>{isSyncing ? 'Memuat...' : 'Sinkron'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab-like status selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4">
        <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-gray-850 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedStatus('live')}
            className={`px-3 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatus === 'live'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-850 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${selectedStatus === 'live' ? 'animate-ping' : ''}`} />
            <span>LIVE</span>
          </button>
          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`px-3 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
              selectedStatus === 'upcoming'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-850 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Mendatang
          </button>
          <button
            onClick={() => setSelectedStatus('finished')}
            className={`px-3 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
              selectedStatus === 'finished'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-850 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Sport quick filters scroll row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-gray-850">
        {SPORT_OPTIONS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-2xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSport === sport.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/10'
                : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100 text-slate-700 dark:bg-gray-900 dark:border-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-850'
            }`}
          >
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Search Input for Matchups */}
      <div className="relative w-full mb-5">
        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari tim, liga, atau pebalap..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-2xs sm:text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-gray-850 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500"
        />
      </div>

      {/* Grid List of matches */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filteredSchedules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 border border-dashed border-slate-200 dark:border-gray-850 rounded-xl"
            >
              <Activity className="h-7 w-7 text-slate-300 dark:text-gray-700 mx-auto mb-2 animate-pulse" />
              <p className="text-2xs font-bold text-slate-700 dark:text-gray-300">Tidak ada jadwal</p>
              <p className="text-3xs text-slate-400 dark:text-gray-500 mt-0.5">Coba saring dengan kriteria lain</p>
            </motion.div>
          ) : (
            filteredSchedules.map((match) => {
              const isLive = match.status === 'live';
              const isFinished = match.status === 'finished';

              return (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => setSelectedMatch(match)}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isLive
                      ? 'bg-rose-50/30 border-rose-200 dark:bg-rose-950/5 dark:border-rose-900/40 hover:border-rose-400/50 dark:hover:border-rose-400/50 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/80 dark:bg-gray-950 dark:border-gray-850 hover:bg-slate-50/90 dark:hover:bg-gray-900/60 hover:border-indigo-500/30 dark:hover:border-indigo-400/30'
                  }`}
                >
                  {/* Left block: League & Time Info */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg text-center shrink-0 border ${
                      isLive 
                        ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                        : 'bg-white dark:bg-gray-900 border-slate-200/60 dark:border-gray-800'
                    }`}>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400 leading-none mb-1">
                        {match.date}
                      </span>
                      {isLive ? (
                        <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm animate-pulse">
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5 text-slate-400" />
                          {match.time.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                          {match.sport === 'bola' ? '⚽ SEPAK BOLA' :
                           match.sport === 'motogp' ? '🏍️ MOTOGP' :
                           match.sport === 'f1' ? '🏎️ FORMULA 1' :
                           match.sport === 'tenis' ? '🎾 TENIS' :
                           match.sport === 'futsal' ? '👟 FUTSAL' :
                           match.sport === 'bulutangkis' ? '🏸 BULUTANGKIS' :
                           match.sport === 'basket' ? '🏀 BASKET' : '🏆 OLAHRAGA'}
                        </span>
                        {match.round && (
                          <span className="text-[9px] px-1 py-0.2 bg-slate-100 dark:bg-gray-900 text-slate-500 dark:text-gray-400 rounded font-semibold">
                            {match.round}
                          </span>
                        )}
                      </div>
                      <p className="font-display font-bold text-2xs text-slate-900 dark:text-white truncate max-w-[210px] sm:max-w-[280px]">
                        {match.league}
                      </p>
                    </div>
                  </div>

                  {/* Middle block: Competitors/Teams and Score */}
                  <div className="flex-1 flex items-center justify-center md:justify-start px-2 sm:px-6">
                    {match.competitors ? (
                      /* Motorsport or individual with single field */
                      <div className="text-center md:text-left min-w-0">
                        <p className="font-sans font-semibold text-2xs text-slate-700 dark:text-gray-300 italic truncate">
                          {match.competitors}
                        </p>
                        {match.score && (
                          <span className="inline-block text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                            🏁 {match.score}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Team matchups with logos/names */
                      <div className="flex items-center justify-between w-full max-w-xs md:max-w-md gap-4">
                        {/* Team A */}
                        <div className="flex items-center gap-2 flex-1 justify-end min-w-0 text-right">
                          <span className="font-display font-bold text-2xs text-slate-800 dark:text-gray-200 truncate">
                            {match.homeTeam}
                          </span>
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 dark:bg-gray-900 border border-slate-200/50 dark:border-gray-800 text-[8px] font-black text-slate-500 tracking-tighter shrink-0">
                            {match.homeLogo}
                          </span>
                        </div>

                        {/* Score or VS Badge */}
                        <div className="shrink-0 text-center px-1.5">
                          {isFinished || isLive ? (
                            <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-md tracking-wider ${
                              isLive 
                                ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                                : 'bg-slate-200/70 dark:bg-gray-900 text-slate-800 dark:text-gray-200'
                            }`}>
                              {match.score}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-widest">
                              vs
                            </span>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 dark:bg-gray-900 border border-slate-200/50 dark:border-gray-800 text-[8px] font-black text-slate-500 tracking-tighter shrink-0">
                            {match.awayLogo}
                          </span>
                          <span className="font-display font-bold text-2xs text-slate-800 dark:text-gray-200 truncate">
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right block: Live stream TV broadcast indicator */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t border-dashed border-slate-200/60 dark:border-gray-850 md:border-0 shrink-0">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-gray-500">
                      <Tv className="h-3 w-3 shrink-0 text-indigo-500/80 dark:text-indigo-400/80" />
                      <span className="text-3xs font-bold uppercase tracking-wider">{match.tvChannel}</span>
                    </div>

                    {isLive && (
                      <div className="flex items-center gap-1 text-[9px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        <Play className="h-2 w-2 fill-current" />
                        <span>SIARAN</span>
                      </div>
                    )}

                    {isFinished && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-900 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>Selesai</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Live sports update footer note */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-gray-900 flex items-center justify-between text-4xs sm:text-2xs text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-indigo-500" />
          <span>Waktu pertandingan mengikuti zona WIB (GMT+7).</span>
        </span>
        <span className="hover:underline cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
          <span>Lihat Klasemen Lengkap</span>
          <ChevronRight className="h-2.5 w-2.5" />
        </span>
      </div>

      {/* Match Center detailed Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <MatchCenterModal
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
