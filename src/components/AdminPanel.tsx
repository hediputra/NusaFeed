import React, { useState, useEffect } from 'react';
import {
  Lock, Key, SlidersHorizontal, Plus, FileText, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle, Search, HelpCircle, ArrowLeft, ToggleLeft, ToggleRight, Pause, Play, Sparkles
} from 'lucide-react';
import { FeedSource, ActivityLog } from '../types.ts';

interface AdminPanelProps {
  token: string | null;
  onLoginSuccess: (token: string, username: string) => void;
  onLogout: () => void;
  sources: FeedSource[];
  fetchSources: () => Promise<void>;
}

export default function AdminPanel({
  token,
  onLoginSuccess,
  onLogout,
  sources,
  fetchSources,
}: AdminPanelProps) {
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Panel Tabs
  const [activeTab, setActiveTab] = useState<'sources' | 'add' | 'logs'>('sources');

  // Manual Add / Edit States
  const [isEditing, setIsEditing] = useState<string | null>(null); // holds source ID if editing
  const [sourceName, setSourceName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [category, setCategory] = useState('Sepak Bola');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (token) {
      fetchSources();
      if (activeTab === 'logs') {
        fetchLogs();
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
            Dashboard Pengelolaan NusaFeed
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
