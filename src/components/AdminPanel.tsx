import React, { useState, useEffect } from 'react';
import {
  Lock, Key, SlidersHorizontal, Plus, FileText, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Search, HelpCircle, ArrowLeft, ToggleLeft, ToggleRight, Pause, Play, Sparkles, Upload, ImageIcon, BookOpen
} from 'lucide-react';
import { FeedSource, ActivityLog } from '../types.ts';

interface AdminPanelProps {
  token: string | null;
  onLoginSuccess: (token: string, username: string) => void;
  onLogout: () => void;
  sources: FeedSource[];
  fetchSources: () => Promise<void>;
  fetchArticles?: () => Promise<void>;
}

export default function AdminPanel({
  token,
  onLoginSuccess,
  onLogout,
  sources,
  fetchSources,
  fetchArticles,
}: AdminPanelProps) {
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Panel Tabs
  const [activeTab, setActiveTab] = useState<'sources' | 'add' | 'write' | 'logs'>('sources');

  // Manual Add / Edit States
  const [isEditing, setIsEditing] = useState<string | null>(null); // holds source ID if editing
  const [sourceName, setSourceName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [category, setCategory] = useState('Sepak Bola');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Write Manual Article States
  const [writeTitle, setWriteTitle] = useState('');
  const [writeCategory, setWriteCategory] = useState('Sepak Bola');
  const [writeContent, setWriteContent] = useState(''); // WYSIWYG editor content
  const [writeImageUrl, setWriteImageUrl] = useState('');
  const [writeSourceName, setWriteSourceName] = useState('Editorial OneNationPress Sport');
  const [writeSourceSiteUrl, setWriteSourceSiteUrl] = useState('https://onenationpress.com');
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writeSuccess, setWriteSuccess] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  const [manualArticles, setManualArticles] = useState<any[]>([]);
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  // Auto-Discovery States
  const [discoverUrl, setDiscoverUrl] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  // Manual Refresh States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{ totalFetched: number; results: any[] } | null>(null);

  // Activity Logs States
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Search filter for sources in admin table
  const [sourcesSearchQuery, setSourcesSearchQuery] = useState('');

  // Fetch logs on request
  const fetchLogs = async () => {
    if (!token) return;
    setIsLoadingLogs(true);
    try {
      const response = await fetch('/api/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Fetch manual articles list
  const fetchManualArticles = async () => {
    setIsLoadingManual(true);
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      if (data.success) {
        const manual = data.articles.filter((a: any) => a.feedSourceId === 'manual');
        setManualArticles(manual);
      }
    } catch (err) {
      console.error('Gagal mengambil berita manual:', err);
    } finally {
      setIsLoadingManual(false);
    }
  };

  // Delete a manual article
  const handleDeleteManualArticle = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${title}"?`)) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        await fetchManualArticles();
        if (fetchArticles) {
          await fetchArticles(); // update main feed in parent component
        }
      } else {
        alert(data.error || 'Gagal menghapus berita.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus.');
    }
  };

  // Image Upload handler with canvas resizing to prevent db bloat
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setWriteImageUrl(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual news publishing submission
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setWriteError(null);
    setWriteSuccess(null);
    setIsPublishing(true);

    if (!writeTitle.trim()) {
      setWriteError('Judul berita wajib diisi.');
      setIsPublishing(false);
      return;
    }
    if (!writeContent.trim()) {
      setWriteError('Konten berita olahraga wajib diisi.');
      setIsPublishing(false);
      return;
    }

    // Google News quality criteria checks
    const plainText = writeContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (writeTitle.trim().length < 20) {
      setWriteError('Kualitas Konten Rendah: Judul berita minimal 20 karakter untuk standar penulisan Google News.');
      setIsPublishing(false);
      return;
    }
    if (plainText.length < 150) {
      setWriteError('Kualitas Konten Rendah: Isi berita terlalu pendek (minimal 150 karakter teks murni) agar layak diindeks Google News.');
      setIsPublishing(false);
      return;
    }

    try {
      const response = await fetch('/api/articles/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: writeTitle,
          summary: writeContent,
          category: writeCategory,
          imageUrl: writeImageUrl,
          sourceName: writeSourceName,
          sourceSiteUrl: writeSourceSiteUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWriteSuccess('Berita olahraga berhasil dipublikasikan secara langsung!');
        setWriteTitle('');
        setWriteContent('');
        setWriteImageUrl('');
        
        // Clear visual editor area HTML content
        const wysiwyg = document.getElementById('wysiwyg-editor-area');
        if (wysiwyg) {
          wysiwyg.innerHTML = '';
        }

        await fetchManualArticles();
        if (fetchArticles) {
          await fetchArticles(); // update main feed
        }
      } else {
        setWriteError(data.error || 'Gagal mempublikasikan berita.');
      }
    } catch (err: any) {
      setWriteError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSources();
      if (activeTab === 'logs') {
        fetchLogs();
      } else if (activeTab === 'write') {
        fetchManualArticles();
      }
    }
  }, [token, activeTab]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.token, data.username);
      } else {
        setLoginError(data.error || 'Autentikasi gagal.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Trigger manual refresh
  const triggerManualRefresh = async () => {
    if (!token || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshResult(null);

    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRefreshResult({
          totalFetched: data.totalFetched,
          results: data.results,
        });
        await fetchSources(); // update lastFetched dates
        if (activeTab === 'logs') {
          await fetchLogs();
        }
      } else {
        alert(data.error || 'Gagal merefresh feed.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat merefresh.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-discover Feed URL
  const handleAutoDiscover = async () => {
    if (!discoverUrl.trim()) return;
    setIsDiscovering(true);
    setDiscoverError(null);
    setFormSuccess(null);

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: discoverUrl }),
      });

      const data = await response.json();
      if (data.success) {
        setSourceName(data.title || '');
        setSiteUrl(discoverUrl);
        setFeedUrl(data.feedUrl);
        setFormSuccess('RSS Feed berhasil dideteksi secara otomatis! Silakan tinjau data di bawah ini dan klik Simpan.');
      } else {
        setDiscoverError(data.error || 'Feed tidak terdeteksi.');
      }
    } catch (err: any) {
      setDiscoverError(err.message || 'Gagal melakukan deteksi.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Save Source (Create or Edit)
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSaving(true);

    if (!sourceName.trim() || !siteUrl.trim() || !feedUrl.trim()) {
      setFormError('Nama, URL Situs, dan URL Feed wajib diisi.');
      setIsSaving(false);
      return;
    }

    try {
      const url = isEditing ? `/api/sources/${isEditing}` : '/api/sources';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sourceName,
          siteUrl,
          feedUrl,
          category,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormSuccess(isEditing ? 'Sumber berita berhasil diperbarui!' : 'Sumber berita baru berhasil ditambahkan!');
        // Reset form
        if (!isEditing) {
          setSourceName('');
          setSiteUrl('');
          setFeedUrl('');
          setCategory('Sepak Bola');
          setDiscoverUrl('');
        } else {
          setIsEditing(null);
        }
        await fetchSources();
      } else {
        setFormError(data.error || 'Gagal menyimpan sumber berita.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Pause / Resume Feed
  const toggleSourceActive = async (source: FeedSource) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !source.isActive }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchSources();
      }
    } catch (err) {
      console.error('Failed to toggle source status:', err);
    }
  };

  // Delete Feed Source
  const handleDeleteSource = async (id: string, name: string) => {
    if (!token) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus sumber "${name}"? Semua artikel dari sumber ini juga akan dihapus.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        await fetchSources();
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  // Load Source to Edit Mode
  const startEditSource = (source: FeedSource) => {
    setIsEditing(source.id);
    setSourceName(source.name);
    setSiteUrl(source.siteUrl);
    setFeedUrl(source.feedUrl);
    setCategory(source.category || 'Sepak Bola');
    setActiveTab('add');
    setFormError(null);
    setFormSuccess(null);
  };

  // Clear Activity Logs
  const clearActivityLogs = async () => {
    if (!token) return;
    if (!confirm('Apakah Anda yakin ingin membersihkan seluruh log aktivitas?')) return;
    try {
      const response = await fetch('/api/logs/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // Filter sources based on search
  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(sourcesSearchQuery.toLowerCase()) ||
    s.feedUrl.toLowerCase().includes(sourcesSearchQuery.toLowerCase())
  );

  // If not logged in, render beautiful administrative gate
  if (!token) {
    return (
      <div id="login-form-wrapper" className="mx-auto max-w-md my-16 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Panel Administrasi</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Silakan masuk menggunakan kredensial administrator Anda untuk mengelola sumber berita.
            </p>
          </div>

          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">@</span>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-gray-900"
                />
              </div>
            </div>

            {loginError && (
              <div id="login-error" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-xs">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Memvalidasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-900 pt-4 text-center">
            <span className="text-2xs font-mono text-gray-400 dark:text-gray-500">
              Kredensial Default: admin / admin123
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard main layout
  return (
    <div id="admin-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin actions header */}
      <div id="admin-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
            Dashboard Pengelolaan OneNationPress Sport
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Selamat datang, Administrator. Kelola sumber berita, pantau log, atau picu sinkronisasi manual.
          </p>
        </div>

        {/* Sync trigger button */}
        <div>
          <button
            id="refresh-all-btn"
            onClick={triggerManualRefresh}
            disabled={isRefreshing}
            className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sedang Menyinkronkan...' : 'Picu Refresh Semua Feed Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Manual refresh feedback stats banner */}
      {refreshResult && (
        <div id="refresh-result-banner" className="mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Sinkronisasi Selesai!</h4>
              <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                Berhasil mengambil <strong>{refreshResult.totalFetched}</strong> artikel baru. Status per sumber:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {refreshResult.results.map((res: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-white/50 dark:bg-gray-950/30 p-2 rounded-lg text-2xs border border-emerald-100/50 dark:border-emerald-900/10">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{res.sourceName}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${res.status === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'}`}>
                      {res.status === 'success' ? `+${res.count}` : 'Gagal'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Sub Tabs */}
      <div id="admin-tabs" className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
        <button
          id="tab-btn-sources"
          onClick={() => { setActiveTab('sources'); setIsEditing(null); }}
          className={`flex items-center gap-1.5 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sources'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Kelola Sumber ({sources.length})</span>
        </button>

        <button
          id="tab-btn-add"
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-1.5 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'add'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>{isEditing ? 'Edit Sumber Berita' : 'Tambah Sumber / Auto-Discover'}</span>
        </button>

        <button
          id="tab-btn-write"
          onClick={() => { setActiveTab('write'); fetchManualArticles(); }}
          className={`flex items-center gap-1.5 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'write'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Buat Berita Baru</span>
        </button>

        <button
          id="tab-btn-logs"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Log Aktivitas</span>
        </button>
      </div>

      {/* Content for TAB: Manage Sources */}
      {activeTab === 'sources' && (
        <div id="sources-management-view" className="space-y-4">
          {/* Quick filter search bar */}
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="sources-search-input"
                type="text"
                placeholder="Cari nama atau URL feed..."
                value={sourcesSearchQuery}
                onChange={(e) => setSourcesSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Sumber Berita</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Sinkronisasi Terakhir</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {filteredSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Tidak ada sumber berita ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSources.map((source) => (
                    <tr key={source.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-950 dark:text-white">{source.name}</div>
                        <div className="text-2xs text-gray-400 dark:text-gray-500 font-mono mt-0.5 truncate max-w-[280px]">
                          {source.feedUrl}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-2xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {source.category || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                        {source.lastFetchedAt
                          ? new Date(source.lastFetchedAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Belum pernah'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          id={`toggle-source-status-btn-${source.id}`}
                          onClick={() => toggleSourceActive(source)}
                          title={source.isActive ? 'Klik untuk nonaktifkan sementara' : 'Klik untuk mengaktifkan kembali'}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold cursor-pointer transition-all ${
                            source.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400'
                          }`}
                        >
                          {source.isActive ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                          {source.isActive ? 'Aktif' : 'Pause'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-source-btn-${source.id}`}
                            onClick={() => startEditSource(source)}
                            title="Edit Sumber"
                            className="p-1.5 rounded bg-gray-50 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 dark:bg-gray-900 dark:hover:bg-indigo-950 dark:text-gray-400 dark:hover:text-indigo-400 transition-all cursor-pointer border border-gray-200/50 dark:border-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-source-btn-${source.id}`}
                            onClick={() => handleDeleteSource(source.id, source.name)}
                            title="Hapus Sumber"
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/50 dark:text-red-400 dark:hover:text-red-300 transition-all cursor-pointer border border-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for TAB: Add / Edit Source with Auto-Discover */}
      {activeTab === 'add' && (
        <div id="add-edit-source-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section A: Smart Auto Discovery (Disabled if editing existing) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
              <h3 className="font-display font-bold text-gray-950 dark:text-white text-base mb-2 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span>Deteksi Otomatis RSS Feed</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">
                Punya URL situs media baru? Masukkan URL utamanya saja (misal: <code>detik.com</code> atau <code>tempo.co</code>). Sistem kami akan secara cerdas memindai HTML untuk menemukan alamat RSS/Atom Feed yang valid secara otomatis!
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="discover-url-input" className="block text-2xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Alamat URL Utama Situs
                  </label>
                  <div className="relative">
                    <input
                      id="discover-url-input"
                      type="text"
                      disabled={!!isEditing || isDiscovering}
                      placeholder="https://www.republika.co.id"
                      value={discoverUrl}
                      onChange={(e) => setDiscoverUrl(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-gray-900 disabled:opacity-50"
                    />
                  </div>
                </div>

                {discoverError && (
                  <div id="discover-error-banner" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-xs">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span>{discoverError}</span>
                  </div>
                )}

                <button
                  id="discover-btn"
                  type="button"
                  disabled={!!isEditing || isDiscovering || !discoverUrl.trim()}
                  onClick={handleAutoDiscover}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-400 py-2.5 text-xs font-bold transition-all border border-indigo-200/30 cursor-pointer disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Menganalisis Alamat URL...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Mulai Pindai & Deteksi Otomatis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section B: Add / Edit Form */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-900 pb-3">
                <h3 className="font-display font-bold text-gray-950 dark:text-white text-base">
                  {isEditing ? 'Form Edit Rincian Sumber Berita' : 'Form Entri Sumber Berita'}
                </h3>
                {isEditing && (
                  <button
                    id="cancel-edit-btn"
                    onClick={() => {
                      setIsEditing(null);
                      setSourceName('');
                      setSiteUrl('');
                      setFeedUrl('');
                      setCategory('Sepak Bola');
                      setDiscoverUrl('');
                      setFormError(null);
                      setFormSuccess(null);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Batal Edit</span>
                  </button>
                )}
              </div>

              <form id="save-source-form" onSubmit={handleSaveSource} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="source-name-input" className="block text-2xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Nama Sumber Berita *
                    </label>
                    <input
                      id="source-name-input"
                      type="text"
                      required
                      placeholder="Contoh: Kompas.com"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="category-select" className="block text-2xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Kategori Liputan *
                    </label>
                    <select
                      id="category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    >
                      <option value="Sepak Bola">Sepak Bola</option>
                      <option value="MotoGP">MotoGP</option>
                      <option value="F1">F1</option>
                      <option value="Tenis">Tenis</option>
                      <option value="Futsal">Futsal</option>
                      <option value="Bulutangkis">Bulutangkis</option>
                      <option value="Basket">Basket</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="site-url-input" className="block text-2xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Alamat Beranda Situs (Site URL) *
                  </label>
                  <input
                    id="site-url-input"
                    type="url"
                    required
                    placeholder="https://www.kompas.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="feed-url-input" className="block text-2xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Alamat RSS/Atom Feed (Feed URL) *
                  </label>
                  <input
                    id="feed-url-input"
                    type="url"
                    required
                    placeholder="https://news.kompas.com/feed"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                {formError && (
                  <div id="form-error-banner" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-xs">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div id="form-success-banner" className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <button
                  id="save-source-submit-btn"
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan Sumber' : 'Simpan Sumber Berita Baru'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB: Write Manual Article */}
      {activeTab === 'write' && (() => {
        const getPlainText = (html: string) => {
          if (!html) return '';
          return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        };

        const titleLength = writeTitle.trim().length;
        const titleWords = writeTitle.trim().split(/\s+/).filter(Boolean).length;

        const plainTextContent = getPlainText(writeContent);
        const contentLength = plainTextContent.length;
        const contentWords = plainTextContent.split(/\s+/).filter(Boolean).length;

        return (
          <div id="manual-article-editor-view" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
                  <h3 className="font-display font-bold text-gray-950 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Tulis & Unggah Berita Olahraga Mandiri</span>
                  </h3>

                  <form id="publish-article-form" onSubmit={handlePublishArticle} className="space-y-4">
                    <div>
                      <label htmlFor="write-title-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider flex justify-between">
                        <span>Judul Berita Olahraga *</span>
                        <span className="text-3xs text-gray-400 font-normal">Disarankan 30 - 90 karakter</span>
                      </label>
                      <input
                        id="write-title-input"
                        type="text"
                        required
                        placeholder="Contoh: Timnas Indonesia Menang Telak 3-0 Melawan Arab Saudi"
                        value={writeTitle}
                        onChange={(e) => setWriteTitle(e.target.value)}
                        className={`w-full rounded-lg border bg-white py-2.5 px-4 text-sm outline-none transition-all dark:bg-gray-950 dark:text-white ${
                          writeTitle.trim() === ''
                            ? 'border-gray-200 focus:border-indigo-500 dark:border-gray-800'
                            : titleLength < 20
                            ? 'border-red-500 focus:border-red-500 dark:border-red-950/60'
                            : titleLength < 30
                            ? 'border-amber-400 focus:border-amber-500 dark:border-amber-950/60'
                            : titleLength <= 90
                            ? 'border-emerald-500 focus:border-emerald-600 dark:border-emerald-950/60'
                            : 'border-amber-500 focus:border-amber-600 dark:border-amber-950/60'
                        }`}
                      />
                      <div className="flex items-center justify-between mt-1 px-1 text-2xs">
                        <span className={
                          writeTitle.trim() === ''
                            ? 'text-gray-400'
                            : titleLength < 20
                            ? 'text-red-500 font-semibold'
                            : titleLength < 30
                            ? 'text-amber-500 font-semibold'
                            : titleLength <= 90
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-amber-600 dark:text-amber-400 font-semibold'
                        }>
                          {writeTitle.trim() === ''
                            ? 'Belum ada judul.'
                            : titleLength < 20
                            ? '⚠️ Judul terlalu pendek untuk standar Google News (Min. 20 kar.)'
                            : titleLength < 30
                            ? '⚠️ Judul agak pendek (Disarankan 30-90 kar.)'
                            : titleLength <= 90
                            ? '✓ Judul sangat optimal & ideal untuk Google News!'
                            : '⚠️ Judul agak panjang (Disarankan tidak melebihi 90 kar.)'}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {titleLength} kar / {titleWords} kata
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="write-category-select" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                          Kategori Olahraga *
                        </label>
                        <select
                          id="write-category-select"
                          value={writeCategory}
                          onChange={(e) => setWriteCategory(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        >
                          <option value="Sepak Bola">Sepak Bola</option>
                          <option value="MotoGP">MotoGP</option>
                          <option value="F1">F1</option>
                          <option value="Tenis">Tenis</option>
                          <option value="Futsal">Futsal</option>
                          <option value="Bulutangkis">Bulutangkis</option>
                          <option value="Basket">Basket</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="write-source-name-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                          Nama Penulis / Redaksi
                        </label>
                        <input
                          id="write-source-name-input"
                          type="text"
                          placeholder="Redaksi OneNationPress"
                          value={writeSourceName}
                          onChange={(e) => setWriteSourceName(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* WYSIWYG Editor */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider flex justify-between">
                        <span>Isi Berita Lengkap (Rich Text WYSIWYG Editor) *</span>
                        <span className="text-3xs text-gray-400 font-normal">Min. 150 karakter teks murni</span>
                      </label>
                      <div className={`rounded-xl overflow-hidden border ${
                        writeContent.trim() === ''
                          ? 'border-gray-200 dark:border-gray-800'
                          : contentLength < 150
                          ? 'border-red-400 focus-within:border-red-500 dark:border-red-950'
                          : contentLength < 400
                          ? 'border-amber-400 focus-within:border-amber-500 dark:border-amber-950'
                          : 'border-emerald-500 focus-within:border-emerald-600 dark:border-emerald-950'
                      }`}>
                        <RichTextEditor
                          value={writeContent}
                          onChange={setWriteContent}
                          mode={editorMode}
                          setMode={setEditorMode}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 px-1 text-2xs">
                        <span className={
                          writeContent.trim() === ''
                            ? 'text-gray-400'
                            : contentLength < 150
                            ? 'text-red-500 font-semibold'
                            : contentLength < 400
                            ? 'text-amber-500 font-semibold'
                            : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        }>
                          {writeContent.trim() === ''
                            ? 'Konten belum ditulis.'
                            : contentLength < 150
                            ? '⚠️ Terlalu pendek untuk standar Google News (Min. 150 kar.)'
                            : contentLength < 400
                            ? '⚠️ Berita agak ringkas (Direkomendasikan > 400 kar. agar lebih mendalam)'
                            : '✓ Kedalaman konten sangat baik untuk kelayakan indeksasi Google News!'}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {contentLength} kar / {contentWords} kata
                        </span>
                      </div>
                    </div>

                    {/* Image Upload Zone */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Foto Sampul Berita (Gambar Pendukung)
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Drag & Drop Upload Block */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-850 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-950/30 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-all relative">
                          <input
                            id="cover-file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="h-6 w-6 text-gray-400 mb-2" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pilih / Seret Foto</span>
                          <span className="text-3xs text-gray-400 mt-1">Format JPG, PNG (Kompresi otomatis)</span>
                        </div>

                        {/* URL input Block */}
                        <div className="flex flex-col justify-center space-y-2">
                          <span className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase">Atau masukkan URL gambar langsung</span>
                          <input
                            id="write-image-url-input"
                            type="text"
                            placeholder="https://example.com/images/bola.jpg"
                            value={writeImageUrl.startsWith('data:') ? '' : writeImageUrl}
                            onChange={(e) => setWriteImageUrl(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                          />
                          {writeImageUrl.startsWith('data:') && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-2xs font-semibold">
                              <CheckCircle className="h-3 w-3" />
                              <span>Gambar berhasil diunggah langsung!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Preview Block */}
                      {writeImageUrl && (
                        <div className="mt-3 relative w-full max-w-md h-36 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-850">
                          <img src={writeImageUrl} alt="Preview Sampul" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setWriteImageUrl('')}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {writeError && (
                      <div id="write-error-banner" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-xs">
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                        <span>{writeError}</span>
                      </div>
                    )}

                    {writeSuccess && (
                      <div id="write-success-banner" className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
                        <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{writeSuccess}</span>
                      </div>
                    )}

                    <button
                      id="publish-submit-btn"
                      type="submit"
                      disabled={isPublishing}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/15 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{isPublishing ? 'Mempublikasikan Berita...' : 'Publikasikan Berita Olahraga Sekarang'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Quality Compliance Score & Existing Manual Articles */}
              <div className="lg:col-span-4 space-y-6">
                {/* Google News Real-time Quality Checker Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-gray-950 dark:text-white text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                    <span>Pemeriksa Kualitas Berita</span>
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-2xs leading-relaxed">
                    Analisis real-time ini memastikan artikel Anda memenuhi kriteria dan kebijakan kelayakan Google News & Discover.
                  </p>

                  <div className="space-y-3.5 border-t border-gray-100 dark:border-gray-900 pt-3">
                    {/* Title check */}
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 rounded-full p-0.5 flex items-center justify-center shrink-0 ${
                        titleLength >= 30 && titleLength <= 90
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : titleLength >= 20
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {titleLength >= 20 ? (
                          titleLength >= 30 && titleLength <= 90 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </span>
                      <div className="text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white">Kelayakan Judul</p>
                        <p className="text-gray-500 dark:text-gray-400 text-3xs mt-0.5">
                          {titleLength === 0 ? 'Belum diisi' : `${titleLength} karakter (${titleWords} kata)`}
                        </p>
                      </div>
                    </div>

                    {/* Content check */}
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 rounded-full p-0.5 flex items-center justify-center shrink-0 ${
                        contentLength >= 400
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : contentLength >= 150
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {contentLength >= 150 ? (
                          contentLength >= 400 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </span>
                      <div className="text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white">Kepadatan Konten</p>
                        <p className="text-gray-500 dark:text-gray-400 text-3xs mt-0.5">
                          {contentLength === 0 ? 'Belum diisi' : `${contentLength} karakter (${contentWords} kata)`}
                        </p>
                      </div>
                    </div>

                    {/* Image check */}
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 rounded-full p-0.5 flex items-center justify-center shrink-0 ${
                        writeImageUrl
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {writeImageUrl ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </span>
                      <div className="text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white">Visual Pendukung</p>
                        <p className="text-gray-500 dark:text-gray-400 text-3xs mt-0.5">
                          {writeImageUrl ? 'Foto sampul aktif' : 'Tanpa gambar pendukung'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* General Warning Alerts */}
                  {(titleLength < 20 || contentLength < 150) && (
                    <div className="rounded-xl bg-red-50/50 dark:bg-red-950/15 p-3 border border-red-200/50 dark:border-red-900/30">
                      <div className="flex gap-2 text-2xs text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <p className="font-bold">Kualitas Belum Layak Terbit</p>
                          <p className="mt-1 leading-relaxed text-3xs">
                            Isi minimal 20 karakter judul dan 150 karakter konten berita agar tombol publikasi dapat diproses dengan sukses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {titleLength >= 20 && titleLength < 30 && contentLength >= 150 && (
                    <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/15 p-3 border border-amber-200/50 dark:border-amber-900/30">
                      <div className="flex gap-2 text-2xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <p className="font-bold">Kualitas Cukup Terpenuhi</p>
                          <p className="mt-1 leading-relaxed text-3xs">
                            Persyaratan dasar terpenuhi, namun disarankan memperpanjang judul hingga 30 karakter untuk meminimalkan penalti SEO Google.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {titleLength >= 30 && titleLength <= 90 && contentLength >= 400 && writeImageUrl && (
                    <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/15 p-3 border border-emerald-200/50 dark:border-emerald-900/30 animate-pulse">
                      <div className="flex gap-2 text-2xs text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                        <div>
                          <p className="font-bold">Berita Sangat Berkualitas!</p>
                          <p className="mt-1 leading-relaxed text-3xs">
                            Format dan struktur konten sangat ideal. Berita ini sangat siap bersaing di laman utama Google News & Discover.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
                  <h4 className="font-display font-bold text-gray-950 dark:text-white text-sm mb-3">
                    Kelola Berita Unggahan Mandiri ({manualArticles.length})
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">
                    Daftar di bawah ini menampilkan seluruh berita yang Anda buat secara mandiri. Anda dapat memantau atau menghapusnya kapan saja.
                  </p>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {isLoadingManual ? (
                      <div className="text-center py-8 text-xs text-gray-400">
                        Memuat rincian berita...
                      </div>
                    ) : manualArticles.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-100 dark:border-gray-900 rounded-xl">
                        Belum ada berita mandiri yang diunggah.
                      </div>
                    ) : (
                      manualArticles.map((art) => (
                        <div key={art.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-900/50 flex flex-col justify-between gap-2.5 transition-all">
                          <div className="min-w-0">
                            <span className="inline-block text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded mb-1.5">
                              {art.category || 'Olahraga'}
                            </span>
                            <h5 className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug">
                              {art.title}
                            </h5>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">
                              {new Date(art.publishedAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 border-t border-gray-150/40 dark:border-gray-800/40 pt-2 mt-1">
                            <button
                              id={`delete-manual-btn-${art.id}`}
                              onClick={() => handleDeleteManualArticle(art.id, art.title)}
                              className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400 p-1.5 rounded transition-all cursor-pointer"
                              title="Hapus berita"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Hapus Berita</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Content for TAB: Activity Logs */}
      {activeTab === 'logs' && (
        <div id="logs-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-gray-950 dark:text-white text-base">
              Riwayat Pengambilan RSS Feed (Activity Logs)
            </h3>
            <button
              id="clear-logs-btn"
              onClick={clearActivityLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 text-xs font-semibold px-3 py-1.5 transition-all cursor-pointer disabled:opacity-40 border border-transparent dark:border-red-900/35"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bersihkan Semua Log</span>
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
            {isLoadingLogs ? (
              <div className="flex justify-center items-center py-16 text-gray-400">
                <svg className="animate-spin h-6 w-6 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memuat catatan aktivitas...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FileText className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                <span>Belum ada log aktivitas terdaftar. Klik 'Refresh Sekarang' untuk memicu sync pertama.</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-900 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {log.sourceName}
                        </span>
                        <span className="font-mono text-3xs sm:text-2xs text-gray-400 dark:text-gray-500">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Rich Text WYSIWYG Editor with standard browser formatting commands
function RichTextEditor({
  value,
  onChange,
  mode,
  setMode,
}: {
  value: string;
  onChange: (val: string) => void;
  mode: 'visual' | 'code';
  setMode: (m: 'visual' | 'code') => void;
}) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Sync internal editor content with state on mount or mode change
  React.useEffect(() => {
    if (editorRef.current && mode === 'visual' && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [mode]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Masukkan URL Link:');
    if (url) executeCommand('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Masukkan URL Gambar:');
    if (url) executeCommand('insertImage', url);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-1">
          {mode === 'visual' && (
            <>
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 font-bold text-xs cursor-pointer min-w-7 h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850"
                title="Tebal (Bold)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 italic text-xs cursor-pointer min-w-7 h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850"
                title="Miring (Italic)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 underline text-xs cursor-pointer min-w-7 h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850"
                title="Garis Bawah (Underline)"
              >
                U
              </button>
              <span className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></span>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h1>')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs font-semibold cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1"
                title="Judul Utama (H1)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h2>')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs font-semibold cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1"
                title="Sub Judul (H2)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<p>')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1"
                title="Paragraf (P)"
              >
                P
              </button>
              <span className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></span>
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1.5"
                title="Daftar Bullet"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1.5"
                title="Daftar Angka"
              >
                1. List
              </button>
              <span className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></span>
              <button
                type="button"
                onClick={insertLink}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1.5"
                title="Sisipkan Link"
              >
                Link
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1.5"
                title="Sisipkan Gambar"
              >
                Gambar
              </button>
              <button
                type="button"
                onClick={() => executeCommand('removeFormat')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 text-xs cursor-pointer h-7 flex items-center justify-center border border-gray-150 dark:border-gray-850 px-1"
                title="Bersihkan Format"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`px-2 py-1 rounded text-2xs font-semibold cursor-pointer transition-all ${
              mode === 'visual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            className={`px-2 py-1 rounded text-2xs font-semibold cursor-pointer transition-all ${
              mode === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            HTML / Source
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="p-4 bg-white dark:bg-gray-950 min-h-[300px] max-h-[500px] overflow-y-auto">
        {mode === 'visual' ? (
          <div
            id="wysiwyg-editor-area"
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="outline-none min-h-[280px] prose prose-slate dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200"
            style={{ minHeight: '280px' }}
            placeholder="Mulai menulis berita olahraga di sini... Blok teks untuk memformat."
          />
        ) : (
          <textarea
            id="html-editor-area"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[280px] font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border-0 focus:ring-0 p-2 outline-none rounded"
            placeholder="<p>Mulai menulis dengan tag HTML di sini...</p>"
          />
        )}
      </div>
    </div>
  );
}
