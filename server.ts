import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/db.js';
import { fetchActiveFeeds, discoverFeedUrl } from './src/feedFetcher.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth Middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer mock-admin-token-123') {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Sesi admin tidak valid. Silakan login ulang.' });
  }
}

// 1. API Endpoints

// Public: Get live sports schedules with dynamic status adjustments
const baselineSchedules = [
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

app.get('/api/sports-schedule', (req, res) => {
  // Add some simple randomness to simulate real-time live score ticking on pull
  const seconds = new Date().getSeconds();
  const minute = new Date().getMinutes();
  
  const modifiedSchedules = baselineSchedules.map(match => {
    // 1. Live football match (Persib vs Persija) score ticker
    if (match.id === 'b2') {
      let currentScore = '1 - 0';
      if (minute >= 40) currentScore = '2 - 1';
      else if (minute >= 20) currentScore = '2 - 0';
      return {
        ...match,
        score: currentScore,
        round: minute >= 50 ? 'Pekan 24 (Selesai)' : `Pekan 24 (Menit ${Math.min(90, 45 + Math.floor(minute / 1.2))}')`
      };
    }
    
    // 2. MotoGP live lap & lead distance ticker
    if (match.id === 'm1') {
      const currentLap = 18 + (minute % 8);
      const gap = (0.210 + (seconds % 100) / 300).toFixed(3);
      return {
        ...match,
        round: `Lap ${Math.min(26, currentLap)}/26`,
        score: `Bagnaia memimpin (+${gap}s)`
      };
    }

    // 3. Bulutangkis set scores changes
    if (match.id === 'bd2') {
      const currentSetPoints = `${21 - (minute % 3)}-${15 + (seconds % 5)}`;
      return {
        ...match,
        score: `21-19, ${currentSetPoints}`,
        round: `Final MD (Set 2 - Poin ${currentSetPoints})`
      };
    }

    return match;
  });

  res.json({
    success: true,
    schedules: modifiedSchedules,
    updatedAt: new Date().toISOString()
  });
});

// Public: Get all sources
app.get('/api/sources', (req, res) => {
  res.json({ success: true, sources: db.getSources() });
});

// Admin: Add new source
app.post('/api/sources', requireAdmin, (req, res) => {
  const { name, siteUrl, feedUrl, category } = req.body;
  if (!name || !siteUrl || !feedUrl) {
    return res.status(400).json({ success: false, error: 'Nama, URL Situs, dan URL Feed wajib diisi.' });
  }
  try {
    const newSource = db.addSource({
      name,
      siteUrl,
      feedUrl,
      category: category || 'General',
      isActive: true,
    });
    res.json({ success: true, source: newSource });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update source (isActive, pause, details)
app.patch('/api/sources/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateSource(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Sumber berita tidak ditemukan.' });
  }
  res.json({ success: true, source: updated });
});

// Admin: Delete source
app.delete('/api/sources/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.deleteSource(id);
  res.json({ success: true, message: 'Sumber berita berhasil dihapus.' });
});

// Public: Get articles (optionally filter by source ID)
app.get('/api/articles', (req, res) => {
  const { sourceId } = req.query;
  let articles = db.getArticles();
  if (sourceId) {
    articles = articles.filter((a) => a.feedSourceId === sourceId);
  }
  res.json({ success: true, articles });
});

// Public: Record article click
app.post('/api/articles/:id/click', (req, res) => {
  const { id } = req.params;
  const updated = db.clickArticle(id);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
  }
  res.json({ success: true, article: updated });
});

// Admin: Add manually written article with rich text content
app.post('/api/articles/manual', requireAdmin, (req, res) => {
  const { title, summary, category, imageUrl, sourceName, sourceSiteUrl } = req.body;
  if (!title || !summary || !category) {
    return res.status(400).json({ success: false, error: 'Judul, konten berita, dan kategori wajib diisi.' });
  }

  try {
    const publishedAt = new Date().toISOString();
    const mockId = db.getArticles().length + 1;
    const link = `https://onenationpress.com/articles/manual-${Date.now()}-${mockId}`;
    
    const newArticle = db.addManualArticle({
      feedSourceId: 'manual',
      sourceName: sourceName || 'Editorial OneNationPress Sport',
      sourceSiteUrl: sourceSiteUrl || 'https://sports.sindonews.com', // default site
      title,
      summary, // WYSIWYG HTML content
      category,
      imageUrl: imageUrl || '',
      link,
      publishedAt,
    });

    res.json({ success: true, article: newArticle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Gagal menyimpan berita manual.' });
  }
});

// Admin: Delete an article by ID
app.delete('/api/articles/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.deleteArticle(id);
    res.json({ success: true, message: 'Artikel berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Gagal menghapus artikel.' });
  }
});

// Admin: Get activity logs
app.get('/api/logs', requireAdmin, (req, res) => {
  res.json({ success: true, logs: db.getLogs() });
});

// Admin: Clear activity logs
app.post('/api/logs/clear', requireAdmin, (req, res) => {
  db.clearLogs();
  res.json({ success: true, message: 'Log aktivitas berhasil dibersihkan.' });
});

// Admin: Trigger manual refresh of active feeds
app.post('/api/refresh', requireAdmin, async (req, res) => {
  try {
    const { totalFetched, results } = await fetchActiveFeeds();
    res.json({ success: true, totalFetched, results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Gagal menyegarkan RSS feed.' });
  }
});

// Admin: Auto-discover feed URL from site URL
app.post('/api/discover', requireAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL Situs wajib diisi.' });
  }
  
  try {
    const discovered = await discoverFeedUrl(url);
    if (discovered) {
      res.json({ success: true, ...discovered });
    } else {
      res.status(404).json({ success: false, error: 'Tidak dapat mendeteksi RSS/Atom feed dari URL ini secara otomatis. Silakan masukkan URL feed secara manual.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Terjadi kesalahan saat mencari feed.' });
  }
});

// Public: Login admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username dan password wajib diisi.' });
  }
  
  const admin = db.validateAdmin(username, password);
  if (admin) {
    res.json({
      success: true,
      token: 'mock-admin-token-123',
      username: admin.username,
    });
  } else {
    res.status(401).json({ success: false, error: 'Username atau password admin salah.' });
  }
});

// Lazy initialisation helper for Gemini API
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY belum dikonfigurasi di server.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Public: Summarize article using Biznet GIO AI or Gemini AI
app.post('/api/summarize', async (req, res) => {
  const { title, summary } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Judul artikel wajib disertakan.' });
  }

  const prompt = `Berikan ringkasan eksekutif berpoin (maksimal 3 poin singkat) dalam Bahasa Indonesia yang informatif untuk artikel berita berikut:\nJudul: ${title}\nRingkasan Awal: ${summary || 'Tidak ada ringkasan'}\n\nFormat output harus berupa elemen HTML daftar poin sederhana (<ul><li>...) agar rapi saat dirender di antarmuka situs berita. Pastikan bahasanya profesional dan objektif.`;

  // Try Biznet GIO AI if the key is provided
  const biznetKey = process.env.BIZNET_API_KEY;
  if (biznetKey && biznetKey !== '' && biznetKey !== 'MY_BIZNET_API_KEY') {
    try {
      console.log('Menggunakan Biznet GIO AI untuk ringkasan...');
      const baseUrl = process.env.BIZNET_API_BASE_URL || 'https://api.biznetgio.ai/v1';
      const model = process.env.BIZNET_MODEL || 'openai/gpt-oss-20b';
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${biznetKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Biznet API error (${response.status}): ${errText}`);
      }

      const data: any = await response.json();
      const aiSummary = data?.choices?.[0]?.message?.content || '';
      if (aiSummary) {
        return res.json({ success: true, summary: aiSummary });
      } else {
        throw new Error('Biznet GIO AI mengembalikan respons kosong.');
      }
    } catch (biznetError: any) {
      console.error('Gagal memanggil Biznet GIO AI, beralih ke fallback Gemini...', biznetError);
    }
  }

  // Fallback to Gemini AI
  try {
    console.log('Menggunakan Gemini AI untuk ringkasan...');
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiSummary = response.text || 'Gagal menghasilkan ringkasan AI.';
    res.json({ success: true, summary: aiSummary });
  } catch (error: any) {
    console.error('Gemini summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal terhubung ke AI Engine. Pastikan API Key dikonfigurasi dengan benar di panel pengaturan.'
    });
  }
});

// SEO & Sitemap
app.get('/sitemap.xml', (req, res) => {
  const articles = db.getArticles();
  const sources = db.getSources();
  const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Home page
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  
  // Sources filter pages
  for (const source of sources) {
    xml += `  <url>\n    <loc>${baseUrl}/?source=${source.id}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }
  
  // Top 150 articles in sitemap
  const recentArticles = articles.slice(0, 150);
  for (const article of recentArticles) {
    const escapedLink = article.link
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    xml += `  <url>\n    <loc>${escapedLink}</loc>\n    <lastmod>${article.publishedAt.substring(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  }
  
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml`);
});


// 2. Setup dev server middleware or serve production assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Running in DEVELOPMENT mode via Vite middleware');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Running in PRODUCTION mode serving dist folder');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initial fetch of active feeds on startup so DB is populated immediately
    console.log('Performing initial startup fetch of feeds...');
    fetchActiveFeeds().then((res) => {
      console.log(`Initial startup fetch completed. Fetched ${res.totalFetched} articles.`);
    }).catch((err) => {
      console.error('Initial startup fetch failed:', err);
    });
    
    // Setup interval to fetch every 1 hour (3600000 ms)
    setInterval(() => {
      console.log('Running periodic fetch of feeds...');
      fetchActiveFeeds().catch((err) => console.error('Periodic fetch failed:', err));
    }, 60 * 60 * 1000);
  });
}

startServer();
