import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Bell, Flame, Sparkles, TrendingUp } from 'lucide-react';

interface ToastMessage {
  id: string;
  sport: 'bola' | 'motogp' | 'f1' | 'tenis' | 'futsal' | 'bulutangkis' | 'basket';
  title: string;
  message: string;
  type: 'goal' | 'score' | 'update' | 'match_start';
  timestamp: string;
}

const SCORE_UPDATES: Omit<ToastMessage, 'id' | 'timestamp'>[] = [
  {
    sport: 'bola',
    title: '⚽ GOAL! Liga 1 Indonesia',
    message: 'Persib Bandung 2 - 0 Persija Jakarta (David da Silva 78\')',
    type: 'goal',
  },
  {
    sport: 'bulutangkis',
    title: '🏸 UPDATE SKOR! Indonesia Open',
    message: 'Final Ganda Putra Set 2: Fajar/Rian memimpin 21-19, 17-15 vs Liang/Wang (CHN)',
    type: 'score',
  },
  {
    sport: 'motogp',
    title: '🏍️ LIVE UPDATE! MotoGP Assen',
    message: 'Lap 22/26: Jorge Martin memangkas jarak menjadi (+0.145s) di belakang Bagnaia!',
    type: 'update',
  },
  {
    sport: 'bola',
    title: '⚽ FULL TIME! Liga 1',
    message: 'Selesai: Persib Bandung 2 - 0 Persija Jakarta. Maung Bandung amankan 3 poin!',
    type: 'score',
  },
  {
    sport: 'basket',
    title: '🏀 LIVE SCORE! IBL Indonesia',
    message: 'Q2 - Satria Muda 42 - 38 Prawira Bandung. Pertandingan sengit di Britama Arena!',
    type: 'score',
  },
  {
    sport: 'tenis',
    title: '🎾 SET COMPLETED! Wimbledon',
    message: 'Set 1: Jannik Sinner mengamankan set pertama 6-4 atas Carlos Alcaraz',
    type: 'update',
  },
  {
    sport: 'futsal',
    title: '👟 LIVE SCORE! Pro Futsal League',
    message: 'Bintang Timur Surabaya 4 - 3 Black Steel Papua (Sisa waktu 2 menit)',
    type: 'score',
  },
];

export default function LiveScoreToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Show first toast after 8 seconds
    const initialTimer = setTimeout(() => {
      triggerNextToast();
    }, 8000);

    // Then periodically trigger every 25 seconds
    const interval = setInterval(() => {
      triggerNextToast();
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [index]);

  const triggerNextToast = () => {
    const rawUpdate = SCORE_UPDATES[index % SCORE_UPDATES.length];
    const newToast: ToastMessage = {
      ...rawUpdate,
      id: `toast-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setToasts((prev) => [...prev, newToast].slice(-2)); // Keep max 2 toasts on screen
    setIndex((prev) => prev + 1);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div 
      id="live-score-toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine side accent color based on sport/type
          let accentColor = 'bg-indigo-500';
          if (toast.type === 'goal') accentColor = 'bg-emerald-500 animate-pulse';
          else if (toast.sport === 'motogp' || toast.sport === 'f1') accentColor = 'bg-rose-500';
          else if (toast.sport === 'bulutangkis' || toast.sport === 'tenis') accentColor = 'bg-amber-500';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto relative overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 p-4 pr-9 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95"
            >
              {/* Left Accent strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} />

              <div className="flex items-start gap-3">
                {/* Live notification bell icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  toast.type === 'goal'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                }`}>
                  <Bell className="h-4 w-4 animate-bounce" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 justify-between">
                    <span className="font-display font-extrabold text-3xs uppercase tracking-wider text-slate-800 dark:text-gray-200">
                      {toast.title}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-gray-500">
                      {toast.timestamp}
                    </span>
                  </div>
                  <p className="font-sans font-medium text-2xs sm:text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-2.5 right-2.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-300 transition-colors"
                title="Tutup"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
