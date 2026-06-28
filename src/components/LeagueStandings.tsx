import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Check, TrendingUp, TrendingDown, Minus, Shield, Activity } from 'lucide-react';

interface StandingTeam {
  position: number;
  name: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  logoColor: string;
}

interface LeagueData {
  id: string;
  name: string;
  country: string;
  logo: string;
  teams: StandingTeam[];
}

const INITIAL_LEAGUES: LeagueData[] = [
  {
    id: 'liga1',
    name: 'Liga 1 Indonesia',
    country: 'Indonesia',
    logo: '🇮🇩',
    teams: [
      { position: 1, name: 'Persib Bandung', shortName: 'PSB', played: 24, won: 16, drawn: 6, lost: 2, goalsFor: 48, goalsAgainst: 30, goalDifference: 18, points: 54, trend: 'up', logoColor: 'bg-blue-600' },
      { position: 2, name: 'Borneo FC Samarinda', shortName: 'BOR', played: 24, won: 15, drawn: 7, lost: 2, goalsFor: 42, goalsAgainst: 27, goalDifference: 15, points: 52, trend: 'down', logoColor: 'bg-orange-500' },
      { position: 3, name: 'Persija Jakarta', shortName: 'PSJ', played: 24, won: 14, drawn: 6, lost: 4, goalsFor: 39, goalsAgainst: 29, goalDifference: 10, points: 48, trend: 'same', logoColor: 'bg-red-600' },
      { position: 4, name: 'Persebaya Surabaya', shortName: 'PBY', played: 24, won: 13, drawn: 6, lost: 5, goalsFor: 35, goalsAgainst: 29, goalDifference: 6, points: 45, trend: 'up', logoColor: 'bg-emerald-600' },
      { position: 5, name: 'Bali United', shortName: 'BLU', played: 24, won: 12, drawn: 6, lost: 6, goalsFor: 38, goalsAgainst: 34, goalDifference: 4, points: 42, trend: 'down', logoColor: 'bg-red-700' },
    ],
  },
  {
    id: 'epl',
    name: 'Premier League',
    country: 'Inggris',
    logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teams: [
      { position: 1, name: 'Manchester City', shortName: 'MCI', played: 38, won: 28, drawn: 4, lost: 6, goalsFor: 96, goalsAgainst: 44, goalDifference: 52, points: 88, trend: 'same', logoColor: 'bg-sky-400' },
      { position: 2, name: 'Arsenal', shortName: 'ARS', played: 38, won: 27, drawn: 5, lost: 6, goalsFor: 91, goalsAgainst: 43, goalDifference: 48, points: 86, trend: 'up', logoColor: 'bg-red-500' },
      { position: 3, name: 'Liverpool', shortName: 'LIV', played: 38, won: 25, drawn: 7, lost: 6, goalsFor: 86, goalsAgainst: 50, goalDifference: 36, points: 82, trend: 'same', logoColor: 'bg-red-700' },
      { position: 4, name: 'Aston Villa', shortName: 'AVL', played: 38, won: 20, drawn: 8, lost: 10, goalsFor: 76, goalsAgainst: 61, goalDifference: 15, points: 68, trend: 'up', logoColor: 'bg-amber-800' },
      { position: 5, name: 'Tottenham Hotspur', shortName: 'TOT', played: 38, won: 20, drawn: 6, lost: 12, goalsFor: 74, goalsAgainst: 61, goalDifference: 13, points: 66, trend: 'down', logoColor: 'bg-slate-700' },
    ],
  },
  {
    id: 'laliga',
    name: 'La Liga',
    country: 'Spanyol',
    logo: '🇪🇸',
    teams: [
      { position: 1, name: 'Real Madrid', shortName: 'RMA', played: 38, won: 29, drawn: 5, lost: 4, goalsFor: 87, goalsAgainst: 26, goalDifference: 61, points: 92, trend: 'up', logoColor: 'bg-purple-700' },
      { position: 2, name: 'Barcelona', shortName: 'BAR', played: 38, won: 26, drawn: 7, lost: 5, goalsFor: 79, goalsAgainst: 40, goalDifference: 39, points: 85, trend: 'same', logoColor: 'bg-blue-800' },
      { position: 3, name: 'Girona FC', shortName: 'GIR', played: 38, won: 25, drawn: 6, lost: 7, goalsFor: 85, goalsAgainst: 53, goalDifference: 32, points: 81, trend: 'down', logoColor: 'bg-red-500' },
      { position: 4, name: 'Atletico Madrid', shortName: 'ATM', played: 38, won: 24, drawn: 4, lost: 10, goalsFor: 70, goalsAgainst: 43, goalDifference: 27, points: 76, trend: 'up', logoColor: 'bg-red-600' },
      { position: 5, name: 'Athletic Bilbao', shortName: 'ATH', played: 38, won: 19, drawn: 11, lost: 8, goalsFor: 61, goalsAgainst: 40, goalDifference: 21, points: 68, trend: 'same', logoColor: 'bg-red-800' },
    ],
  },
];

export default function LeagueStandings() {
  const [activeLeagueId, setActiveLeagueId] = useState<string>('liga1');
  const [leagues, setLeagues] = useState<LeagueData[]>(INITIAL_LEAGUES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hari ini, 03:30 WIB');

  const activeLeague = leagues.find((l) => l.id === activeLeagueId) || leagues[0];

  const handleSyncData = () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    // Simulate standard REST data synchronization fetch trigger
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      
      const now = new Date();
      const formattedTime = `Hari ini, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      setLastSyncTime(formattedTime);

      // Slightly shuffle points to simulate real changes (Persib might gain +1, etc)
      setLeagues((prev) => 
        prev.map((league) => {
          if (league.id === 'liga1') {
            return {
              ...league,
              teams: league.teams.map((t) => {
                if (t.name === 'Persib Bandung') {
                  return { ...t, points: 57, played: 25, won: 17, goalDifference: 19, goalsFor: 49 };
                }
                if (t.name === 'Borneo FC Samarinda') {
                  return { ...t, points: 53, played: 25, drawn: 8 };
                }
                return t;
              })
            };
          }
          return league;
        })
      );

      // Reset success checkmark after 4 seconds
      setTimeout(() => {
        setSyncSuccess(false);
      }, 4000);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-gray-850 dark:bg-gray-950 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-gray-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
              <span>Klasemen Liga Utama</span>
              <span className="text-[10px] lowercase text-indigo-500 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40">
                live
              </span>
            </h2>
            <p className="text-3xs sm:text-2xs text-slate-400 dark:text-gray-500">
              Peringkat klub sepak bola terupdate dari turnamen favorit
            </p>
          </div>
        </div>

        {/* Action: Synchronize Standings */}
        <button
          onClick={handleSyncData}
          disabled={isSyncing}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-2xs font-extrabold cursor-pointer transition-all ${
            syncSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850'
          }`}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
              <span>Menyelaraskan...</span>
            </>
          ) : syncSuccess ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Data Disinkronkan!</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
              <span>Sinkronkan Skor</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs to switch League Standings */}
      <div className="flex bg-slate-100/80 dark:bg-gray-900 p-1 rounded-xl border border-slate-200/40 dark:border-gray-850 mb-5 gap-1">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => {
              setActiveLeagueId(league.id);
              setSyncSuccess(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
              activeLeagueId === league.id
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-gray-700/30'
                : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-sm shrink-0 leading-none">{league.logo}</span>
            <span className="truncate">{league.name}</span>
          </button>
        ))}
      </div>

      {/* Standings Table Container */}
      <div className="overflow-x-auto select-none rounded-xl border border-slate-100 dark:border-gray-900">
        <table className="w-full text-left border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-gray-900/40 border-b border-slate-100 dark:border-gray-900">
              <th className="py-2.5 px-3.5 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider w-12 text-center">Pos</th>
              <th className="py-2.5 px-2 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider">Tim</th>
              <th className="py-2.5 px-3 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider text-center w-14">Main</th>
              <th className="py-2.5 px-3 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider text-center w-14">M - S - K</th>
              <th className="py-2.5 px-3 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider text-center w-12">SG</th>
              <th className="py-2.5 px-3.5 text-3xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider text-center w-14 bg-indigo-50/40 dark:bg-indigo-950/10 font-bold text-indigo-600 dark:text-indigo-400">Poin</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {activeLeague.teams.map((team, idx) => {
                // Highlight champions position / relegation limit with subtle bullet tints
                let markerClass = 'bg-slate-300 dark:bg-gray-800';
                if (team.position === 1) markerClass = 'bg-amber-500'; // Champion/Leader
                else if (team.position <= 4) markerClass = 'bg-indigo-400'; // Champions League spot

                return (
                  <motion.tr
                    key={`${activeLeague.id}-${team.name}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, delay: idx * 0.04 }}
                    className="border-b border-slate-100/75 dark:border-gray-900/50 hover:bg-slate-50/50 dark:hover:bg-gray-900/10 transition-colors"
                  >
                    {/* Position */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${markerClass}`} />
                        <span className="font-mono text-2xs font-extrabold text-slate-800 dark:text-gray-200">
                          {team.position}
                        </span>
                      </div>
                    </td>

                    {/* Team logo colored block & Name */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono font-extrabold text-[8px] text-white ${team.logoColor}`}>
                          {team.shortName}
                        </span>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-2xs text-slate-800 dark:text-gray-200 truncate">
                            {team.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-gray-500">
                              Trend:
                            </span>
                            {team.trend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />}
                            {team.trend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-rose-500" />}
                            {team.trend === 'same' && <Minus className="h-2.5 w-2.5 text-slate-400" />}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Played matches */}
                    <td className="py-3 px-3 text-center font-mono text-2xs text-slate-600 dark:text-gray-400">
                      {team.played}
                    </td>

                    {/* Won - Drawn - Lost record */}
                    <td className="py-3 px-3 text-center font-mono text-[10px] text-slate-500 dark:text-gray-500 whitespace-nowrap">
                      {team.won} <span className="text-slate-300 dark:text-gray-800">/</span> {team.drawn} <span className="text-slate-300 dark:text-gray-800">/</span> {team.lost}
                    </td>

                    {/* Goal Difference */}
                    <td className={`py-3 px-3 text-center font-mono text-2xs font-bold ${
                      team.goalDifference > 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : team.goalDifference < 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}>
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>

                    {/* Total points */}
                    <td className="py-3 px-3.5 text-center bg-indigo-50/15 dark:bg-indigo-950/5 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {team.points}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Sync Timestamp Info Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-gray-900 flex items-center justify-between text-4xs sm:text-2xs text-slate-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-indigo-500/80" />
          <span>Sinkronisasi otomatis diaktifkan. Diperbarui: <strong>{lastSyncTime}</strong></span>
        </span>
        <span className="text-[10px] text-slate-300 dark:text-gray-700 italic">
          Bento Grid Standings v1.0
        </span>
      </div>
    </div>
  );
}
