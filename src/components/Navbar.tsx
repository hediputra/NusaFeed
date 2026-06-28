import { Newspaper, Moon, Sun, Lock, LogOut, Search, Sparkles, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FeedSource } from '../types.ts';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: 'home' | 'admin';
  setCurrentView: (view: 'home' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  theme,
  toggleTheme,
  currentView,
  setCurrentView,
  isAdminLoggedIn,
  onLogout,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleSpeechSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Pencarian Suara (Web Speech API). Harap gunakan Chrome atau Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setSearchQuery(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 transition-colors duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setCurrentView('home')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500">
            <Newspaper className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              NusaFeed
              <span className="hidden sm:inline rounded-full bg-indigo-100 px-2.5 py-0.5 text-2xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                Agregator & Jadwal Olahraga
              </span>
            </span>
          </div>
        </div>

        {/* Search bar (only on home view) */}
        {currentView === 'home' && (
          <div id="search-container" className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="search-input-desktop"
                type="text"
                placeholder={isListening ? "Mendengarkan..." : "Cari berita terkini..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-gray-900 ${
                  isListening ? 'ring-2 ring-red-500/30 border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                id="mic-search-desktop"
                onClick={toggleSpeechSearch}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer ${
                  isListening
                    ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 animate-pulse'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                title={isListening ? "Hentikan Pencarian Suara" : "Cari dengan Suara (Mic)"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Right side controls */}
        <div id="nav-controls" className="flex items-center gap-2">
          {/* System sync indicator */}
          <div className="hidden lg:flex bg-slate-50 dark:bg-gray-850 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-300 items-center gap-2 border border-slate-200/60 dark:border-gray-800/80">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Sistem Sinkron: Berhasil</span>
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Admin Panel toggle / Login action */}
          {currentView === 'home' ? (
            <button
              id="admin-panel-btn"
              onClick={() => setCurrentView('admin')}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 text-sm font-medium px-4 py-2 transition-all cursor-pointer border border-transparent dark:border-gray-700"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="home-view-btn"
                onClick={() => setCurrentView('home')}
                className="rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
              >
                Lihat Situs
              </button>
              {isAdminLoggedIn && (
                <button
                  id="admin-logout-btn"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium px-4 py-2 transition-all cursor-pointer border border-transparent dark:border-red-900/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
