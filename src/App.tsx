import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Newspaper, Filter, Search, Sliders, RefreshCw, X, HelpCircle, ChevronRight, TrendingUp, Sparkles, BookOpen, Bookmark, ExternalLink, Clock, Mic, MicOff, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import ArticleVolumeChart from './components/ArticleVolumeChart.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import SportsSchedule from './components/SportsSchedule.tsx';
import LiveScoreToast from './components/LiveScoreToast.tsx';
import LeagueStandings from './components/LeagueStandings.tsx';
import ArticleSkeleton from './components/ArticleSkeleton.tsx';
import TrendingAthletes from './components/TrendingAthletes.tsx';
import { Article, FeedSource } from './types.ts';
import { updateSEO, injectSchemaOrg, getArticleFallbackImage } from './utils.ts';

const CATEGORIES = [
  'Semua Olahraga',
  'Sepak Bola',
  'MotoGP',
  'F1',
  'Tenis',
  'Futsal',
  'Bulutangkis',
  'Basket',
  'Lainnya',
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function App() {
  // Theme & View States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('nusafeed-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  // Admin Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('nusafeed-admin-token'));
  const [adminUser, setAdminUser] = useState<string | null>(() => localStorage.getItem('nusafeed-admin-user'));

  // Feed Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Olahraga');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorting and Article Preview States
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'populer'>('terbaru');
  const [selectedArticleForPreview, setSelectedArticleForPreview] = useState<Article | null>(null);
  const [isReaderMode, setIsReaderMode] = useState<boolean>(false);
  const [readerFontSize, setReaderFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [readerBgTheme, setReaderBgTheme] = useState<'paper' | 'sepia' | 'dark'>('sepia');
  const [readerFontFamily, setReaderFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [appFontFamily, setAppFontFamily] = useState<'sans' | 'serif' | 'mono'>(() => {
    const stored = localStorage.getItem('nusafeed-app-font');
    if (stored === 'sans' || stored === 'serif' || stored === 'mono') return stored;
    return 'sans';
  });

  useEffect(() => {
    localStorage.setItem('nusafeed-app-font', appFontFamily);
  }, [appFontFamily]);

  // Mobile voice search states
  const [isMobileListening, setIsMobileListening] = useState(false);
  const mobileRecognitionRef = useRef<any>(null);

  const toggleMobileSpeechSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Pencarian Suara (Web Speech API). Harap gunakan Chrome atau Edge.');
      return;
    }

    if (isMobileListening) {
      if (mobileRecognitionRef.current) {
        mobileRecognitionRef.current.stop();
      }
      setIsMobileListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsMobileListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setSearchQuery(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsMobileListening(false);
        };

        recognition.onend = () => {
          setIsMobileListening(false);
        };

        mobileRecognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsMobileListening(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (mobileRecognitionRef.current) {
        mobileRecognitionRef.current.stop();
      }
    };
  }, []);

  // Saved Articles States
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nusafeed-saved-articles');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Scroll spy and progress tracking inside the preview modal
  const [modalScrollProgress, setModalScrollProgress] = useState<number>(0);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      const progress = (target.scrollTop / totalHeight) * 100;
      setModalScrollProgress(progress);
    } else {
      setModalScrollProgress(0);
    }
  };

  // Reset scroll and progress when switching articles
  useEffect(() => {
    if (selectedArticleForPreview) {
      setModalScrollProgress(0);
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }
  }, [selectedArticleForPreview]);

  // Find 3 other articles with the same category
  const relatedArticles = useMemo(() => {
    if (!selectedArticleForPreview) return [];

    const currentSourceObj = sources.find((s) => s.id === selectedArticleForPreview.feedSourceId);
    const currentCategory = currentSourceObj?.category || 'Nasional';

    return articles
      .filter((art) => {
        if (art.id === selectedArticleForPreview.id) return false;
        const srcObj = sources.find((s) => s.id === art.feedSourceId);
        const artCategory = srcObj?.category || 'Nasional';
        return artCategory.toLowerCase() === currentCategory.toLowerCase();
      })
      .slice(0, 3);
  }, [selectedArticleForPreview, articles, sources]);

  // Identify top 5 trending articles with the most clicks in the last 24 hours
  const trendingArticleIds = useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    return articles
      .map((art) => {
        const clicks24h = (art.clicks || []).filter(
          (clickTime) => new Date(clickTime).getTime() > twentyFourHoursAgo
        ).length;
        return { id: art.id, clicks24h };
      })
      .filter((item) => item.clicks24h > 0)
      .sort((a, b) => b.clicks24h - a.clicks24h)
      .slice(0, 5)
      .map((item) => item.id);
  }, [articles]);

  const handleToggleSave = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const updated = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem('nusafeed-saved-articles', JSON.stringify(updated));
      return updated;
    });
  };

  const handleArticleClick = async (article: Article) => {
    setSelectedArticleForPreview(article);
    try {
      const response = await fetch(`/api/articles/${article.id}/click`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.article) {
        setArticles((prev) =>
          prev.map((art) => (art.id === article.id ? { ...art, clicks: data.article.clicks } : art))
        );
      }
    } catch (err) {
      console.error('Gagal merekam klik artikel:', err);
    }
  };

  // Apply Theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nusafeed-theme', theme);
  }, [theme]);

  // Handle dynamic SEO and Schema injection on data update or view change
  useEffect(() => {
    if (currentView === 'home') {
      updateSEO(
        'NusaFeed - Agregator & Jadwal Olahraga',
        'Menyajikan berita olahraga terkini serta jadwal pertandingan real-time untuk Sepak Bola, MotoGP, F1, tenis, futsal, dan lainnya.'
      );
    } else {
      updateSEO('Panel Pengelola - NusaFeed', 'Kelola sumber berita, pantau log, dan picu penyegaran manual feed berita.');
    }
  }, [currentView]);

  useEffect(() => {
    if (articles.length > 0) {
      injectSchemaOrg(articles);
    }
  }, [articles]);

  // Fetch Sources from server
  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error('Gagal mengambil daftar sumber berita:', e);
    }
  };

  // Fetch Articles from server
  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      } else {
        setError(data.error || 'Terjadi kesalahan saat memuat berita.');
      }
    } catch (e: any) {
      setError(e.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchSources();
    fetchArticles();
  }, []);

  // Admin Login and Logout Actions
  const handleLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUser(username);
    localStorage.setItem('nusafeed-admin-token', token);
    localStorage.setItem('nusafeed-admin-user', username);
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('nusafeed-admin-token');
    localStorage.removeItem('nusafeed-admin-user');
  };

  // Toggle Theme between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Filter logic on client-side (fully dynamic & lightning-fast!)
  const filteredArticles = articles.filter((article) => {
    // 0. Saved articles check
    const matchesSaved = !showSavedOnly || savedArticleIds.includes(article.id);

    // 1. Source ID check
    const matchesSource = selectedSourceId === 'all' || article.feedSourceId === selectedSourceId;
    
    // 2. Category check (we resolve the category by matching the article source's category)
    const sourceObj = sources.find((s) => s.id === article.feedSourceId);
    const sourceCategory = sourceObj?.category || 'Lainnya';
    const matchesCategory = selectedCategory === 'Semua Olahraga' || sourceCategory.toLowerCase() === selectedCategory.toLowerCase();

    // 3. Search query check (fuzzy title and summary matching)
    const matchesSearch =
      searchQuery.trim() === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.sourceName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSaved && matchesSource && matchesCategory && matchesSearch;
  });

  // Sorted Articles based on active sortBy selection
  const sortedArticles = useMemo(() => {
    const list = [...filteredArticles];
    if (sortBy === 'terbaru') {
      return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'terlama') {
      return list.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else if (sortBy === 'populer') {
      return list.sort((a, b) => {
        const clicksA = (a.clicks || []).length;
        const clicksB = (b.clicks || []).length;
        if (clicksB !== clicksA) {
          return clicksB - clicksA;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    }
    return list;
  }, [filteredArticles, sortBy]);

  const activeSourceObj = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col justify-between relative ${
      appFontFamily === 'sans' ? 'font-sans' : appFontFamily === 'serif' ? 'font-serif' : 'font-mono'
    }`}>
      {/* Thin Progress Bar */}
      {isLoading && (
        <motion.div
          id="loading-progress-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 0.3, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 z-[9999] origin-left shadow-[0_1px_10px_rgba(99,102,241,0.5)]"
        />
      )}
      <div>
        {/* Navigation Bar */}
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          currentView={currentView}
          setCurrentView={setCurrentView}
          isAdminLoggedIn={!!adminToken}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {currentView === 'home' ? (
          <main id="home-view-container" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            
            {/* Banner/Hero Section */}
            <div id="hero-banner" className="relative mb-8 overflow-hidden rounded-2xl bg-indigo-900 text-white shadow-lg dark:bg-indigo-950 border border-indigo-800 dark:border-indigo-900">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-950/80 mix-blend-multiply" />
              <div className="relative px-6 py-10 md:py-14 max-w-3xl">
                <div className="flex items-center gap-2 mb-3.5 text-indigo-200 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
                  <span>Teknologi Agregator Olahraga Modern</span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Berita Olahraga & Jadwal Pertandingan Terlengkap
                </h1>
                <p className="mt-3 text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
                  NusaFeed menyajikan berita olahraga terkini dari media terkemuka di Indonesia serta pusat jadwal pertandingan dan live score real-time untuk Sepak Bola, MotoGP, F1, Tenis, Futsal, Bulutangkis, dan cabang olahraga lainnya.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <div className="rounded-lg bg-indigo-800/80 px-3 py-1.5 text-xs font-semibold text-indigo-100 border border-indigo-700/50">
                    Liputan Olahraga Terpadu
                  </div>
                  <div className="rounded-lg bg-indigo-800/80 px-3 py-1.5 text-xs font-semibold text-indigo-100 border border-indigo-700/50">
                    Jadwal & Skor Real-Time
                  </div>
                  <div className="rounded-lg bg-indigo-800/80 px-3 py-1.5 text-xs font-semibold text-indigo-100 border border-indigo-700/50">
                    Fokus Niche Olahraga
                  </div>
                </div>
              </div>
            </div>

            {/* Main Filters & News Grid Container */}
            <div id="news-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Filter sidebar */}
              <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
                
                {/* Mobile Search input (shown only on mobile) */}
                <div id="mobile-search" className="md:hidden">
                  <div className="relative w-full">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="search-input-mobile"
                      type="text"
                      placeholder={isMobileListening ? "Mendengarkan..." : "Cari berita terkini..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-lg border bg-white py-2 pl-10 pr-10 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white ${
                        isMobileListening ? 'ring-2 ring-red-500/30 border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      id="mic-search-mobile"
                      onClick={toggleMobileSpeechSearch}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer ${
                        isMobileListening
                          ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 animate-pulse'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                      title={isMobileListening ? "Hentikan Pencarian Suara" : "Cari dengan Suara (Mic)"}
                    >
                      {isMobileListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Filter Box */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-900">
                    <h3 className="font-display font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Filter className="h-4.5 w-4.5 text-gray-500" />
                      <span>Saring Berita</span>
                    </h3>
                    {(selectedSourceId !== 'all' || selectedCategory !== 'Semua Olahraga' || searchQuery.trim() !== '' || showSavedOnly) && (
                      <button
                        id="reset-all-filters-btn"
                        onClick={() => {
                          setSelectedSourceId('all');
                          setSelectedCategory('Semua Olahraga');
                          setSearchQuery('');
                          setShowSavedOnly(false);
                        }}
                        className="text-2xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {/* Saved Articles Shortcut Button */}
                  <div className="mb-5 pb-4 border-b border-gray-150/60 dark:border-gray-900">
                    <button
                      id="filter-saved-only-btn"
                      onClick={() => {
                        setShowSavedOnly(!showSavedOnly);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl py-2 px-3.5 text-xs font-bold transition-all border cursor-pointer ${
                        showSavedOnly
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/70 text-slate-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className={`h-4 w-4 ${showSavedOnly ? 'fill-current text-white' : 'text-indigo-500'}`} />
                        <span>Artikel Disimpan</span>
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-2xs font-bold ${
                        showSavedOnly ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-gray-800 text-slate-700 dark:text-gray-300'
                      }`}>
                        {savedArticleIds.length}
                      </span>
                    </button>
                  </div>

                  {/* Filter by Category */}
                  <div className="space-y-2">
                    <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider">
                      Berdasarkan Kategori
                    </label>
                    <div className="flex flex-wrap lg:flex-col gap-1 max-h-[160px] lg:max-h-none overflow-y-auto pr-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          id={`filter-category-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left rounded-lg py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter by Publisher/Source */}
                  <div className="space-y-2 mt-5">
                    <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider">
                      Berdasarkan Media
                    </label>
                    <div className="flex flex-wrap lg:flex-col gap-1 max-h-[160px] lg:max-h-none overflow-y-auto pr-1">
                      <button
                        id="filter-source-btn-all"
                        onClick={() => setSelectedSourceId('all')}
                        className={`w-full text-left rounded-lg py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
                          selectedSourceId === 'all'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/50'
                        }`}
                      >
                        Semua Media Terdaftar
                      </button>
                      {sources.map((src) => (
                        <button
                          key={src.id}
                          id={`filter-source-btn-${src.id}`}
                          onClick={() => setSelectedSourceId(src.id)}
                          className={`w-full text-left rounded-lg py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            selectedSourceId === src.id
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/50'
                          }`}
                        >
                          <span className="truncate">{src.name}</span>
                          {!src.isActive && (
                            <span className="rounded bg-amber-50 px-1 py-0.2 text-4xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 uppercase">
                              Pause
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personalisasi Tampilan Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-900">
                    <Sliders className="h-4.5 w-4.5 text-gray-500" />
                    <span>Tampilan</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider">
                      Gaya Font Aplikasi
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200/40 dark:border-gray-850">
                      {[
                        { id: 'sans', name: 'Sans' },
                        { id: 'serif', name: 'Serif' },
                        { id: 'mono', name: 'Mono' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setAppFontFamily(f.id as any)}
                          className={`py-1.5 rounded-lg text-3xs font-extrabold cursor-pointer transition-all ${
                            appFontFamily === f.id
                              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/20 dark:border-gray-700/30'
                              : 'text-slate-500 hover:text-slate-850 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic News Grid */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Sports Match and Tournament Schedule Center */}
                <div id="sports-schedule-widget">
                  <SportsSchedule />
                </div>
                
                {/* League Standings Table */}
                <div id="league-standings-widget">
                  <LeagueStandings />
                </div>
                
                {/* Trending Athletes Section */}
                <div id="trending-athletes-widget">
                  <TrendingAthletes />
                </div>
                
                {/* Active filter status label row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan <strong>{filteredArticles.length}</strong> berita dari total{' '}
                    <strong>{articles.length}</strong> artikel terkini
                    {(selectedSourceId !== 'all' || selectedCategory !== 'Semua Olahraga' || searchQuery.trim() !== '' || showSavedOnly) && (
                      <span className="ml-1">
                        dengan filter aktif (
                        {showSavedOnly && 'Disimpan'}
                        {selectedCategory !== 'Semua Olahraga' && `${showSavedOnly ? ', ' : ''}${selectedCategory}`}
                        {selectedSourceId !== 'all' && `${showSavedOnly || selectedCategory !== 'Semua Olahraga' ? ', ' : ''}${activeSourceObj?.name}`}
                        {searchQuery.trim() !== '' && `${showSavedOnly || selectedCategory !== 'Semua Olahraga' || selectedSourceId !== 'all' ? ', ' : ''}pencarian: "${searchQuery}"`}
                        )
                      </span>
                    )}
                  </div>

                  {/* Sorting dropdown and Quick trigger */}
                  <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-150/80 dark:bg-gray-900/80 p-1 rounded-lg border border-slate-200 dark:border-gray-800">
                      <button
                        id="view-mode-grid-btn"
                        onClick={() => setIsCompact(false)}
                        title="Tampilan Grid Standard"
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          !isCompact
                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-400'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id="view-mode-compact-btn"
                        onClick={() => setIsCompact(true)}
                        title="Tampilan Daftar Kompak"
                        className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                          isCompact
                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-400'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold hidden md:inline">Kompak</span>
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider hidden sm:inline">Urutan:</span>
                      <div className="relative">
                        <select
                          id="sort-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-white dark:bg-gray-950 text-xs font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-850 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            backgroundSize: '12px',
                          }}
                        >
                          <option value="terbaru">Terbaru</option>
                          <option value="terlama">Terlama</option>
                          <option value="populer">Paling Populer</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick trigger to pull manually */}
                    <button
                      id="quick-fetch-trigger"
                      onClick={fetchArticles}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-950 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer bg-white dark:bg-gray-950 shadow-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Segarkan Berita</span>
                    </button>
                  </div>
                </div>

                {/* 24-Hour Article Publication Volume Chart */}
                {!isLoading && articles.length > 0 && (
                  <ArticleVolumeChart articles={articles} theme={theme} />
                )}

                {/* Main feed error or loading feedback */}
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider animate-pulse mb-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menghubungkan ke NusaFeed Live API...</span>
                    </div>
                    <ArticleSkeleton />
                  </div>
                ) : error ? (
                  <div id="error-card" className="rounded-2xl border border-red-100 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-950/20 text-center max-w-xl mx-auto my-12">
                    <p className="text-red-700 dark:text-red-400 font-bold text-lg mb-1">Gagal Memuat Berita</p>
                    <p className="text-red-600/90 dark:text-red-400/95 text-sm mb-4 leading-relaxed">{error}</p>
                    <button
                      id="retry-fetch-btn"
                      onClick={fetchArticles}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-all cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div id="empty-state-card" className="flex flex-col justify-center items-center py-20 text-center bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 p-8 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-4">
                      <Search className="h-5.5 w-5.5" />
                    </div>
                    <p className="text-base font-bold text-gray-950 dark:text-white mb-1">Berita Tidak Ditemukan</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mb-5">
                      Maaf, kami tidak menemukan artikel yang cocok dengan filter atau kata pencarian Anda. Silakan reset filter untuk melihat semua berita terbaru.
                    </p>
                    <button
                      id="clear-filters-btn-empty"
                      onClick={() => {
                        setSelectedSourceId('all');
                        setSelectedCategory('Semua Olahraga');
                        setSearchQuery('');
                        setShowSavedOnly(false);
                      }}
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
                    >
                      Reset Filter Pencarian
                    </button>
                  </div>
                ) : (
                  <motion.div
                    id="articles-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    key={`${selectedCategory}-${selectedSourceId}-${searchQuery}-${showSavedOnly}-${sortBy}-${isCompact}-${sortedArticles.length}`}
                    className={isCompact ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}
                  >
                    {sortedArticles.map((article, idx) => {
                      const sourceObj = sources.find((s) => s.id === article.feedSourceId);
                      const category = sourceObj?.category || 'Nasional';
                      const isSaved = savedArticleIds.includes(article.id);
                      return (
                        <motion.div
                          key={article.id}
                          variants={itemVariants}
                          className={(!isCompact && idx === 0) ? 'md:col-span-2 lg:col-span-2 md:row-span-2' : 'col-span-1'}
                        >
                          <ArticleCard
                            article={article}
                            isFeatured={!isCompact && idx === 0}
                            isCompact={isCompact}
                            category={category}
                            isSaved={isSaved}
                            isTrending={trendingArticleIds.includes(article.id)}
                            onToggleSave={handleToggleSave}
                            onReadMore={handleArticleClick}
                          />
                        </motion.div>
                      );
                    })}

                    {/* Bento interactive Admin CTA card */}
                    <motion.div
                      variants={itemVariants}
                      className="col-span-1 bg-slate-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between items-center text-center text-white border border-slate-800 dark:border-indigo-950/20"
                    >
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse mt-2">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="my-4">
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">CARI SUMBER LAIN?</span>
                        <h4 className="font-display font-bold text-sm mt-1.5 leading-snug">Ingin sumber feed RSS kustom Anda sendiri?</h4>
                        <p className="text-slate-400 text-2xs mt-2 leading-relaxed">
                          Konfigurasikan dan kelola sumber feed berita langsung melalui panel admin Anda secara mandiri.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="w-full text-center text-xs bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl border border-white/10 cursor-pointer transition-all"
                      >
                        Kelola Feed Sekarang
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </main>
        ) : (
          <AdminPanel
            token={adminToken}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            sources={sources}
            fetchSources={fetchSources}
          />
        )}
      </div>

      {/* Footer conforming strictly to copyright laws and accessibility */}
      <footer
        id="main-footer"
        className="w-full border-t border-gray-200 bg-white py-10 mt-16 dark:border-gray-800 dark:bg-gray-950 text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 dark:border-gray-850 pb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
                <Newspaper className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-gray-950 dark:text-white">
                NusaFeed
              </span>
            </div>
            
            {/* Core SEO links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-2xs uppercase tracking-wider font-semibold">
              <a href="/sitemap.xml" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">Sitemap XML</a>
              <a href="/robots.txt" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">Robots TXT</a>
              <a href="/api/sources" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">API Sources</a>
              <a href="/api/articles" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">API Articles</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <p>&copy; {new Date().getFullYear()} NusaFeed. Semua hak dilindungi.</p>
              <p className="text-2xs text-gray-400 dark:text-gray-500 leading-normal">
                Pernyataan Hak Cipta & Etika: NusaFeed berkomitmen penuh menghormati hak cipta jurnalisme. Kami hanya menayangkan data feed berupa judul berita dan deskripsi ringkas (summary) yang bersumber dari feed sindikasi resmi penerbit asli. Kami tidak menduplikasi konten artikel utuh dan selalu mewajibkan pengalihan tautan penuh langsung ke situs orisinal demi memberikan atribusi penuh kepada tim redaksi asal.
              </p>
            </div>
            <div className="text-2xs font-mono text-gray-400 dark:text-gray-500">
              Waktu Sistem: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </footer>

      {/* Summary Preview Modal conforming to bridging disclaimer requirement */}
      <AnimatePresence>
        {selectedArticleForPreview && (() => {
          const readerHeaderBorderClass = isReaderMode
            ? readerBgTheme === 'paper'
              ? 'border-stone-200/60'
              : readerBgTheme === 'sepia'
                ? 'border-[#ebdcc7]'
                : 'border-zinc-850'
            : 'border-slate-100 dark:border-gray-850';

          const readerSubTextClass = isReaderMode
            ? readerBgTheme === 'paper'
              ? 'text-stone-500'
              : readerBgTheme === 'sepia'
                ? 'text-[#7d5d3f]'
                : 'text-zinc-500'
            : 'text-slate-500 dark:text-gray-400';

          const readerTitleColorClass = isReaderMode
            ? readerBgTheme === 'paper'
              ? 'text-stone-950'
              : readerBgTheme === 'sepia'
                ? 'text-[#2a1b0c]'
                : 'text-white'
            : 'text-slate-900 dark:text-white';

          const titleSizeClass = isReaderMode
            ? readerFontSize === 'md'
              ? 'text-xl sm:text-2xl font-bold'
              : readerFontSize === 'lg'
                ? 'text-2xl sm:text-3xl font-extrabold'
                : 'text-3xl sm:text-4xl font-black'
            : 'text-xl sm:text-2xl font-extrabold';

          const bodySizeClass = isReaderMode
            ? `${readerFontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${
                readerFontSize === 'md'
                  ? 'text-base sm:text-lg leading-relaxed'
                  : readerFontSize === 'lg'
                    ? 'text-lg sm:text-xl leading-loose'
                    : 'text-xl sm:text-2xl leading-loose tracking-wide'
              }`
            : 'text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed';

          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              {/* Backdrop Close Click */}
              <div
                className="absolute inset-0 cursor-default"
                onClick={() => {
                  setSelectedArticleForPreview(null);
                  setIsReaderMode(false);
                }}
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh] transition-all duration-300 border ${
                  isReaderMode
                    ? readerBgTheme === 'paper'
                      ? 'bg-[#faf9f6] text-stone-900 border-stone-200'
                      : readerBgTheme === 'sepia'
                        ? 'bg-[#f8f1e5] text-[#3e2723] border-[#e5d4bc]'
                        : 'bg-zinc-950 text-zinc-100 border-zinc-850'
                    : 'bg-white dark:bg-gray-950 text-slate-900 dark:text-gray-100 border-slate-200 dark:border-gray-850'
                }`}
              >
                {/* Scroll-spy Progress Bar */}
                <div
                  id="modal-scroll-spy"
                  className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 z-[999] origin-left transition-all duration-75"
                  style={{ transform: `scaleX(${modalScrollProgress / 100})` }}
                />

                {/* Modal Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 border-b shrink-0 ${readerHeaderBorderClass}`}>
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                        Ringkasan Berita
                      </span>
                      <span className="text-xs text-slate-300 dark:text-gray-600">|</span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {selectedArticleForPreview.sourceName}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedArticleForPreview(null);
                        setIsReaderMode(false);
                      }}
                      className="sm:hidden rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-900 transition-all cursor-pointer"
                      title="Tutup dialog"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Mode Baca Toggle Button */}
                    <button
                      onClick={() => setIsReaderMode(!isReaderMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isReaderMode
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-gray-900 dark:border-gray-850 dark:text-gray-300 dark:hover:bg-gray-850'
                      }`}
                      title={isReaderMode ? "Matikan Mode Baca" : "Aktifkan Mode Baca"}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Mode Baca {isReaderMode ? 'Aktif' : 'Nonaktif'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedArticleForPreview(null);
                        setIsReaderMode(false);
                      }}
                      className="hidden sm:block rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-900 transition-all cursor-pointer"
                      title="Tutup dialog"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Reader Mode Settings Panel (Only when Reader Mode is Active) */}
                {isReaderMode && (
                  <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
                    readerBgTheme === 'paper'
                      ? 'bg-stone-100/50 border-stone-200/60'
                      : readerBgTheme === 'sepia'
                        ? 'bg-[#eedebf]/40 border-[#e5d4bc]'
                        : 'bg-zinc-900/40 border-zinc-900'
                  }`}>
                    {/* Font Sizes */}
                    <div className="flex items-center gap-2">
                      <span className={`text-2xs font-bold uppercase tracking-wider ${readerSubTextClass}`}>Ukuran Font:</span>
                      <div className={`flex items-center gap-1 rounded-lg p-0.5 border ${
                        readerBgTheme === 'paper'
                          ? 'bg-white border-stone-200'
                          : readerBgTheme === 'sepia'
                            ? 'bg-[#fdf9f2] border-[#e5d4bc]'
                            : 'bg-zinc-950 border-zinc-800'
                      }`}>
                        {(['md', 'lg', 'xl'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setReaderFontSize(size)}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              readerFontSize === size
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {size === 'md' ? 'Kecil' : size === 'lg' ? 'Sedang' : 'Besar'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Family Selection */}
                    <div className="flex items-center gap-2">
                      <span className={`text-2xs font-bold uppercase tracking-wider ${readerSubTextClass}`}>Jenis Font:</span>
                      <div className={`flex items-center gap-1 rounded-lg p-0.5 border ${
                        readerBgTheme === 'paper'
                          ? 'bg-white border-stone-200'
                          : readerBgTheme === 'sepia'
                            ? 'bg-[#fdf9f2] border-[#e5d4bc]'
                            : 'bg-zinc-950 border-zinc-800'
                      }`}>
                        {(['serif', 'sans'] as const).map((font) => (
                          <button
                            key={font}
                            onClick={() => setReaderFontFamily(font)}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              readerFontFamily === font
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
                            }`}
                            style={{ fontFamily: font === 'serif' ? 'Georgia, serif' : 'Inter, sans-serif' }}
                          >
                            {font === 'serif' ? 'Serif' : 'Sans'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Themes */}
                    <div className="flex items-center gap-2">
                      <span className={`text-2xs font-bold uppercase tracking-wider ${readerSubTextClass}`}>Warna:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReaderBgTheme('paper')}
                          title="Tema Kertas"
                          className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center bg-[#faf9f6] text-stone-900 cursor-pointer ${
                            readerBgTheme === 'paper' ? 'border-indigo-600 scale-110' : 'border-stone-300'
                          }`}
                        >
                          <span className="text-[10px] font-bold font-sans">A</span>
                        </button>
                        <button
                          onClick={() => setReaderBgTheme('sepia')}
                          title="Tema Sepia"
                          className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center bg-[#f8f1e5] text-[#3e2723] cursor-pointer ${
                            readerBgTheme === 'sepia' ? 'border-indigo-600 scale-110' : 'border-[#d2be9f]'
                          }`}
                        >
                          <span className="text-[10px] font-bold font-sans">A</span>
                        </button>
                        <button
                          onClick={() => setReaderBgTheme('dark')}
                          title="Tema Gelap"
                          className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center bg-zinc-950 text-zinc-100 cursor-pointer ${
                            readerBgTheme === 'dark' ? 'border-indigo-600 scale-110' : 'border-zinc-800'
                          }`}
                        >
                          <span className="text-[10px] font-bold font-sans">A</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Content */}
                <div
                  ref={modalScrollRef}
                  onScroll={handleModalScroll}
                  className="p-6 overflow-y-auto space-y-6 flex-1"
                >
                  {/* Meta details */}
                  <div className={`flex items-center gap-2.5 text-2xs font-bold uppercase tracking-wider ${readerSubTextClass}`}>
                    <span>{selectedArticleForPreview.sourceName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedArticleForPreview.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className={`font-display leading-tight ${readerTitleColorClass} ${titleSizeClass}`}>
                    {selectedArticleForPreview.title}
                  </h2>

                  {/* Article Banner Image */}
                  <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-900 border border-slate-200/60 dark:border-zinc-800">
                    <img
                      src={selectedArticleForPreview.imageUrl || getArticleFallbackImage(sources.find(s => s.id === selectedArticleForPreview.feedSourceId)?.category)}
                      alt={selectedArticleForPreview.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getArticleFallbackImage(sources.find(s => s.id === selectedArticleForPreview.feedSourceId)?.category);
                      }}
                    />
                  </div>

                  {/* Summary Body (500-750 characters) */}
                  <div className={`whitespace-pre-wrap ${bodySizeClass}`}>
                    {selectedArticleForPreview.summary || 'Maaf, deskripsi berita lengkap tidak tersedia untuk artikel ini.'}
                  </div>

                  {/* Related News Section */}
                  {relatedArticles.length > 0 && (
                    <div className={`pt-6 border-t ${
                      isReaderMode
                        ? readerBgTheme === 'paper'
                          ? 'border-stone-200'
                          : readerBgTheme === 'sepia'
                            ? 'border-[#ebdcc7]'
                            : 'border-zinc-850'
                        : 'border-slate-100 dark:border-gray-850'
                    }`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                        isReaderMode
                          ? readerBgTheme === 'paper'
                            ? 'text-stone-800 font-serif'
                            : readerBgTheme === 'sepia'
                              ? 'text-[#3e2723] font-serif'
                              : 'text-zinc-200'
                          : 'text-slate-800 dark:text-gray-200'
                      }`}>
                        <TrendingUp className="h-4 w-4 text-indigo-500 animate-pulse" />
                        <span>Berita Terkait</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {relatedArticles.map((art) => (
                          <div
                            key={art.id}
                            onClick={() => {
                              handleArticleClick(art);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                              isReaderMode
                                ? readerBgTheme === 'paper'
                                  ? 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-900'
                                  : readerBgTheme === 'sepia'
                                    ? 'bg-[#eedebf]/30 border-[#e5d4bc] hover:bg-[#eedebf]/50 text-[#3e2723]'
                                    : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-100'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 dark:bg-gray-950 dark:border-gray-850 dark:hover:bg-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              {art.sourceName}
                            </span>
                            <h5 className="text-xs font-semibold leading-snug line-clamp-2">
                              {art.title}
                            </h5>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REQUIRED Statement / Jembatan disclaimer */}
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    isReaderMode
                      ? readerBgTheme === 'paper'
                        ? 'bg-stone-100/60 border-stone-200 text-stone-600'
                        : readerBgTheme === 'sepia'
                          ? 'bg-[#f1e6d4] border-[#ebdcc7] text-[#5d4037]'
                          : 'bg-zinc-900/60 border-zinc-850 text-zinc-400'
                      : 'bg-slate-50 dark:bg-gray-900/50 border-slate-150/60 dark:border-gray-850 text-slate-500 dark:text-gray-400'
                  }`}>
                    <div className={`font-bold flex items-center gap-1.5 ${
                      isReaderMode
                        ? readerBgTheme === 'paper'
                          ? 'text-stone-800'
                          : readerBgTheme === 'sepia'
                            ? 'text-[#3e2723]'
                            : 'text-zinc-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                      Pernyataan Hak Cipta
                    </div>
                    <p>
                      Situs ini hanya jembatan dan tidak mengklaim semua materi dari situs sumber. Hak cipta sepenuhnya dipegang oleh penerbit asli berita tersebut. Anda dapat melanjutkan membaca berita lengkap di platform mereka dengan mengeklik tautan di bawah ini.
                    </p>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className={`p-4 border-t flex items-center justify-end gap-3 shrink-0 ${
                  isReaderMode
                    ? readerBgTheme === 'paper'
                      ? 'bg-stone-50 border-stone-200'
                      : readerBgTheme === 'sepia'
                        ? 'bg-[#f4ebd9] border-[#e5d4bc]'
                        : 'bg-zinc-950 border-zinc-850'
                    : 'bg-slate-50 dark:bg-gray-900/40 border-slate-100 dark:border-gray-850'
                }`}>
                  <button
                    onClick={() => {
                      setSelectedArticleForPreview(null);
                      setIsReaderMode(false);
                    }}
                    className={`rounded-xl border text-xs font-bold px-4 py-2.5 transition-all cursor-pointer ${
                      isReaderMode
                        ? readerBgTheme === 'paper'
                          ? 'border-stone-300 hover:bg-stone-100 text-stone-700'
                          : readerBgTheme === 'sepia'
                            ? 'border-[#d7c4a9] hover:bg-[#ebdcc7] text-[#5d4037]'
                            : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                        : 'border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-850 text-slate-600 dark:text-gray-300'
                    }`}
                  >
                    Tutup
                  </button>
                  <a
                    href={selectedArticleForPreview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer"
                  >
                    <span>Kunjungi Situs Sumber</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Live Score Toast Notifications */}
      <LiveScoreToast />
    </div>
  );
}
