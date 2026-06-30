import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';

interface InFeedAdCardProps {
  index: number;
  isCompact?: boolean;
}

const MOCK_ADS = [
  {
    title: 'Terbang ke Sirkuit Mandalika Lebih Hemat! Diskon Tiket Pesawat Hingga 35% Hanya Pekan Ini.',
    sponsor: 'NusaFlight Indonesia',
    cta: 'Pesan Sekarang',
    category: 'Sponsor • Perjalanan',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    description: 'Nikmati penerbangan nyaman ke Lombok untuk menyaksikan langsung gelaran MotoGP Mandalika dengan promo tiket spesial.'
  },
  {
    title: 'Daftar NusaEsport Championship 2026! Total Hadiah Rp 75 Juta untuk Divisi MLBB dan PUBG Mobile.',
    sponsor: 'NusaEsport Arena',
    cta: 'Daftar Gratis',
    category: 'Sponsor • Esports',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    description: 'Tunjukkan kemampuan tim esports Anda di turnamen tingkat nasional terbesar tahun ini. Pendaftaran dibuka gratis!'
  },
  {
    title: 'Diskon Cuci Gudang Jersey Klub Liga 1 & Eropa Terbaru. Beli 1 Gratis 1 + Gratis Ongkir Seluruh Indonesia!',
    sponsor: 'IndoJersey Store',
    cta: 'Belanja Sekarang',
    category: 'Sponsor • Belanja',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    description: 'Jersey premium dengan bahan Dry-Fit berkualitas tinggi siap mendukung tim kesayangan Anda. Stok terbatas!'
  },
  {
    title: 'Raih Beasiswa Atlet Muda Berprestasi 2026. Raih Pelatihan Profesional & Bantuan Dana Pendidikan!',
    sponsor: 'Yayasan Olahraga Nusa',
    cta: 'Ajukan Beasiswa',
    category: 'Sponsor • Edukasi',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    description: 'Program pembinaan atlet muda berbakat untuk bersaing di kancah nasional dan internasional. Kirim portofolio Anda.'
  }
];

export default function InFeedAdCard({ index, isCompact = false }: InFeedAdCardProps) {
  // Select a mock ad based on the index to ensure deterministic rendering but nice variety
  const ad = MOCK_ADS[index % MOCK_ADS.length];

  if (isCompact) {
    return (
      <div 
        id={`infeed-ad-compact-${index}`}
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/5 to-indigo-500/5 hover:from-amber-500/10 hover:to-indigo-500/10 border border-dashed border-amber-500/30 dark:border-amber-500/20 rounded-xl transition-all duration-300"
      >
        <div className="relative h-16 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200/50 dark:border-gray-800">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover grayscale-[30%] opacity-90 hover:grayscale-0 transition-all"
          />
          <div className="absolute top-1 left-1 bg-amber-500 text-[8px] font-extrabold text-white px-1 py-0.2 rounded shadow-xs uppercase tracking-wider scale-90 origin-top-left">
            IKLAN
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {ad.sponsor}
              </span>
              <span className="text-[8px] font-mono px-1 py-0.2 bg-slate-100 dark:bg-zinc-800 text-slate-400 rounded-sm">
                AdSense
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-gray-100 line-clamp-2 leading-snug">
              {ad.title}
            </h4>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[9px] text-slate-400 dark:text-gray-500 truncate max-w-[120px]">
              {ad.category}
            </span>
            <a
              href="https://adsense.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              <span>{ad.cta}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`infeed-ad-card-${index}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-dashed border-indigo-500/30 hover:border-indigo-500/50 dark:border-indigo-500/20 dark:hover:border-indigo-500/40 bg-gradient-to-b from-white to-indigo-50/20 dark:from-gray-950 dark:to-indigo-950/5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Sponsor Label */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-sm">
        <Megaphone className="h-3 w-3 text-amber-400" />
        <span>Sponsor</span>
        <span className="text-slate-500">•</span>
        <span className="text-[8px] text-indigo-300 font-mono">AdSense</span>
      </div>

      {/* Image Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-gray-900 border-b border-slate-100 dark:border-zinc-900">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90 group-hover:scale-104 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
      </div>

      {/* Card Details */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {ad.sponsor}
            </span>
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-gray-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {ad.title}
          </h4>
          <p className="text-2xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {ad.description}
          </p>
        </div>

        {/* Footer with Google AdSense Compliant Label */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            AdSense In-Feed
          </span>
          <a
            href="https://adsense.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xs px-3 py-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>{ad.cta}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
