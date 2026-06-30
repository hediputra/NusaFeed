import { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, Clock, Share2, Check, Bookmark, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { Article } from '../types.ts';
import { getRelativeTime, getArticleFallbackImage } from '../utils.ts';
import NextGenImage from './NextGenImage.tsx';

interface ArticleCardProps {
  article: Article;
  isFeatured?: boolean;
  category?: string;
  isSaved?: boolean;
  isTrending?: boolean;
  onToggleSave?: (articleId: string) => void;
  onReadMore?: (article: Article) => void;
  isCompact?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'sepak bola': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' },
  motogp: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/40' },
  f1: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/40' },
  tenis: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/40' },
  futsal: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/40' },
  bulutangkis: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40' },
  basket: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/40' },
  lainnya: { bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-600 dark:text-gray-400', border: 'border-slate-100 dark:border-slate-800' },
};

export default function ArticleCard({
  article,
  isFeatured = false,
  category = 'Lainnya',
  isSaved = false,
  isTrending = false,
  isCompact = false,
  onToggleSave,
  onReadMore,
}: ArticleCardProps) {
  const [copied, setCopied] = useState(false);
  const [isIntersected, setIsIntersected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setIsIntersected(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // High-res Favicon resolver using Google's S2 Service
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(article.sourceSiteUrl).hostname}`;

  // Estimate reading time based on word count (approx 200 words per minute)
  const readingTime = useMemo(() => {
    const text = `${article.title} ${article.summary || ''}`;
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article.title, article.summary]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || article.title,
          url: article.link,
        });
        return;
      } catch (err) {
        // Fall back if shared was cancelled or disallowed by browser/iframe policies
        console.log('Share API failed or cancelled, falling back to clipboard copy:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin tautan:', err);
    }
  };

  const catLower = category.toLowerCase();
  const catColors = CATEGORY_COLORS[catLower] || CATEGORY_COLORS['lainnya'];

  if (isCompact) {
    return (
      <motion.article
        id={`article-card-${article.id}`}
        ref={containerRef}
        className="group relative flex flex-row items-center gap-4 overflow-hidden rounded-xl border p-3 bg-white/95 border-slate-200/90 dark:border-gray-850 dark:bg-gray-950/95 text-slate-900 dark:text-gray-100 w-full transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-950/70 hover:backdrop-blur-md hover:border-indigo-500/35 dark:hover:border-indigo-400/35"
        whileHover={{
          y: -4,
          scale: 1.01,
          boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.12), 0 6px 6px -5px rgba(0, 0, 0, 0.06)',
        }}
        initial={{ y: 0, scale: 1, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      >
        {/* Left Side: Thumbnail cover image */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-gray-900">
          <NextGenImage
            src={article.imageUrl || getArticleFallbackImage(category)}
            alt={article.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            fallbackSrc={getArticleFallbackImage(category)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
          />
          {isTrending && (
            <div className="absolute top-1 left-1 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 animate-pulse">
              <Flame className="h-2 w-2 fill-current" />
              <span>Trending</span>
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            {/* Publisher, Category and date */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 truncate">
                {isIntersected ? (
                  <img
                    src={faviconUrl}
                    alt={article.sourceName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-4 w-4 rounded bg-slate-50 dark:bg-gray-800 p-0.5 object-contain border border-slate-100 dark:border-gray-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-8-4-8 4z"/></svg>';
                    }}
                  />
                ) : (
                  <div className="h-4 w-4 rounded bg-slate-100 dark:bg-gray-800 animate-pulse border border-slate-200 dark:border-gray-800 shrink-0" />
                )}
                <span className="text-2xs font-bold tracking-tight text-slate-700 dark:text-gray-300 truncate">
                  {article.sourceName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`rounded px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider border ${catColors.bg} ${catColors.border} ${catColors.text}`}>
                  {category}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 hidden sm:inline">{getRelativeTime(article.publishedAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h3
              id={`title-${article.id}`}
              onClick={() => onReadMore?.(article)}
              className="font-display font-bold leading-tight text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors duration-200 line-clamp-2"
            >
              {article.title}
            </h3>

            {/* Summary */}
            <p className="text-2xs text-slate-400 dark:text-gray-500 line-clamp-1 mt-0.5 hidden sm:block italic">
              {article.summary || 'Tidak ada deskripsi singkat tersedia.'}
            </p>
          </div>

          {/* Footer of the compact card */}
          <div className="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-slate-100/60 dark:border-gray-850/60">
            <div className="flex items-center gap-1.5 text-4xs sm:text-2xs text-slate-400 dark:text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{readingTime} mnt</span>
              <span className="sm:hidden">• {getRelativeTime(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id={`save-btn-${article.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave?.(article.id);
                }}
                className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400'
                }`}
              >
                <Bookmark className={`h-3 w-3 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                id={`read-more-btn-${article.id}`}
                onClick={() => onReadMore?.(article)}
                className="flex items-center gap-0.5 rounded-lg text-[10px] font-semibold px-2 py-1 bg-slate-50 hover:bg-indigo-600 dark:bg-gray-900 dark:hover:bg-indigo-500 text-slate-700 hover:text-white dark:text-gray-300 dark:hover:text-white border border-slate-200/50 dark:border-gray-800 transition-all cursor-pointer"
              >
                <span>Selengkapnya</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      id={`article-card-${article.id}`}
      ref={containerRef}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${
        isFeatured
          ? 'md:col-span-2 lg:col-span-2 md:row-span-2 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 md:p-8 border-slate-800 dark:border-indigo-950/50 hover:from-slate-900/90 hover:via-slate-950/90 hover:to-indigo-950/90 hover:backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30'
          : 'bg-white/95 p-5 border-slate-200/90 dark:border-gray-850 dark:bg-gray-950/95 text-slate-900 dark:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-950/70 hover:backdrop-blur-md hover:border-indigo-500/35 dark:hover:border-indigo-400/35'
      }`}
      whileHover={{
        y: -10,
        scale: 1.02,
        boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 12px 12px -5px rgba(0, 0, 0, 0.08)',
      }}
      initial={{ y: 0, scale: 1, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
    >
      <div>
        {/* Article Cover Image */}
        <div className={`relative w-full overflow-hidden rounded-xl mb-4 bg-slate-100 dark:bg-gray-900 ${
          isFeatured ? 'h-52 sm:h-60 md:h-68' : 'h-40 sm:h-44'
        }`}>
          <NextGenImage
            src={article.imageUrl || getArticleFallbackImage(category)}
            alt={article.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            fallbackSrc={getArticleFallbackImage(category)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
          />
          {/* Trending Badge Overlay */}
          {isTrending && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Trending</span>
            </div>
          )}
        </div>

        {/* Top meta row: Source, Favicon and Date */}
        <div id={`meta-row-${article.id}`} className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {isIntersected ? (
              <img
                src={faviconUrl}
                alt={article.sourceName}
                referrerPolicy="no-referrer"
                loading="lazy"
                className={`h-5.5 w-5.5 rounded bg-slate-50 dark:bg-gray-800 p-0.5 object-contain border ${
                  isFeatured ? 'border-slate-800' : 'border-slate-100 dark:border-gray-800'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-8-4-8 4z"/></svg>';
                }}
              />
            ) : (
              <div className="h-5.5 w-5.5 rounded bg-slate-100 dark:bg-gray-800 animate-pulse border border-slate-200 dark:border-gray-800" />
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-bold tracking-tight ${isFeatured ? 'text-slate-200' : 'text-slate-700 dark:text-gray-300'}`}>
                {article.sourceName}
              </span>
              <span className={`text-[10px] font-medium opacity-75 ${isFeatured ? 'text-slate-400' : 'text-slate-500 dark:text-gray-400'}`}>
                • {readingTime} mnt baca
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Category Tag */}
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              isFeatured 
                ? 'bg-red-600/20 border-red-500/30 text-red-400' 
                : `${catColors.bg} ${catColors.border} ${catColors.text}`
            }`}>
              {category}
            </span>
            <div className={`flex items-center gap-1 text-xs ${isFeatured ? 'text-slate-400' : 'text-slate-400 dark:text-gray-500'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{getRelativeTime(article.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          id={`title-${article.id}`}
          onClick={() => onReadMore?.(article)}
          className={`font-display font-bold leading-tight mb-3 cursor-pointer transition-colors duration-200 ${
            isFeatured
              ? 'text-xl sm:text-2xl md:text-3xl text-white group-hover:text-indigo-300'
              : 'text-base md:text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
          }`}
        >
          {article.title}
        </h3>

        {/* Summary Snippet */}
        <p
          id={`summary-${article.id}`}
          className={`text-sm leading-relaxed mb-5 ${
            isFeatured
              ? 'text-slate-300 font-normal line-clamp-5'
              : 'text-slate-500 dark:text-gray-400 line-clamp-4 italic'
          }`}
        >
          {article.summary || 'Tidak ada deskripsi singkat tersedia untuk berita ini.'}
        </p>
      </div>

      {/* Action panel */}
      <div id={`actions-panel-${article.id}`} className={`flex flex-col gap-3 mt-4 pt-4 border-t ${
        isFeatured ? 'border-slate-800' : 'border-slate-100 dark:border-gray-850'
      }`}>
        {/* Buttons */}
        <div className="flex items-center justify-between gap-2.5 w-full">
          {/* Bookmark / Save Button */}
          <button
            id={`save-btn-${article.id}`}
            onClick={(e) => {
              e.preventDefault();
              onToggleSave?.(article.id);
            }}
            title={isSaved ? "Batal simpan artikel" : "Simpan artikel untuk nanti"}
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isFeatured
                ? isSaved
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
                : isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-600 hover:text-slate-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            id={`share-btn-${article.id}`}
            onClick={handleShare}
            title="Bagikan berita ini"
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold px-3 py-2.5 border transition-all cursor-pointer ${
              isFeatured
                ? 'bg-slate-800 hover:bg-slate-755 border-slate-700 text-slate-200 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>Bagikan</span>
              </>
            )}
          </button>

          {/* Read original article button */}
          <button
            id={`read-more-btn-${article.id}`}
            onClick={() => onReadMore?.(article)}
            className={`flex items-center gap-1 rounded-xl text-xs font-semibold px-4 py-2.5 transition-all border cursor-pointer ${
              isFeatured
                ? 'bg-blue-600 hover:bg-blue-500 border-transparent text-white shadow-sm'
                : 'bg-slate-50 hover:bg-indigo-600 dark:bg-gray-900 dark:hover:bg-indigo-500 text-slate-700 hover:text-white dark:text-gray-300 dark:hover:text-white border-slate-200/50 dark:border-gray-800'
            }`}
          >
            <span>Selengkapnya</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
