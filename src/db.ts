import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DBState, FeedSource, Article, ActivityLog, Admin } from './types.js';

const DB_FILE = path.join(process.cwd(), 'src', 'data.db.json');

// Default initial feed sources
const DEFAULT_SOURCES: Omit<FeedSource, 'id' | 'createdAt' | 'lastFetchedAt'>[] = [
  {
    name: 'Detik Sport',
    siteUrl: 'https://sport.detik.com',
    feedUrl: 'https://rss.detik.com/index.php/sport',
    category: 'Lainnya',
    isActive: true,
  },
  {
    name: 'CNN Indonesia Olahraga',
    siteUrl: 'https://www.cnnindonesia.com/olahraga',
    feedUrl: 'https://www.cnnindonesia.com/olahraga/rss',
    category: 'Sepak Bola',
    isActive: true,
  },
  {
    name: 'Bola.net',
    siteUrl: 'https://www.bola.net',
    feedUrl: 'https://www.bola.net/feed/',
    category: 'Sepak Bola',
    isActive: true,
  },
  {
    name: 'Kompas Olahraga',
    siteUrl: 'https://olahraga.kompas.com',
    feedUrl: 'https://olahraga.kompas.com/feed',
    category: 'Lainnya',
    isActive: true,
  },
  {
    name: 'Liputan6 Bola',
    siteUrl: 'https://www.liputan6.com/bola',
    feedUrl: 'https://www.liputan6.com/bola/rss',
    category: 'Sepak Bola',
    isActive: true,
  },
  {
    name: 'Tempo Olahraga',
    siteUrl: 'https://sport.tempo.co',
    feedUrl: 'https://rss.tempo.co/olahraga',
    category: 'Lainnya',
    isActive: true,
  },
  {
    name: 'Antara Olahraga',
    siteUrl: 'https://www.antaranews.com/olahraga',
    feedUrl: 'https://www.antaranews.com/rss/olahraga.xml',
    category: 'Lainnya',
    isActive: true,
  },
];

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function initDb(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content) as DBState;
      
      // Force sports focus: if any legacy non-sports category exists, reset DB to sports-only feeds
      const hasGeneralSources = data.feedSources.some(s => s.category === 'Nasional' || s.category === 'Politik' || s.category === 'Ekonomi');
      if (hasGeneralSources || !data.feedSources || data.feedSources.length === 0) {
        data.feedSources = DEFAULT_SOURCES.map((s, idx) => ({
          ...s,
          id: `source-${idx + 1}`,
          createdAt: new Date().toISOString(),
          lastFetchedAt: null,
        }));
        data.articles = []; // Clear old non-sports articles to start fresh
        saveDb(data);
      }
      
      // Ensure admin exists
      if (!data.admins || data.admins.length === 0) {
        data.admins = [
          {
            id: generateId(),
            username: 'admin',
            passwordHash: hashPassword('admin123'),
          }
        ];
        saveDb(data);
      }
      
      return data;
    }
  } catch (error) {
    console.error('Failed to parse DB, creating fresh DB', error);
  }

  // Create standard fresh DB
  const defaultSources: FeedSource[] = DEFAULT_SOURCES.map((s, idx) => ({
    ...s,
    id: `source-${idx + 1}`,
    createdAt: new Date().toISOString(),
    lastFetchedAt: null,
  }));

  const initialDb: DBState = {
    feedSources: defaultSources,
    articles: [],
    activityLogs: [],
    admins: [
      {
        id: generateId(),
        username: 'admin',
        passwordHash: hashPassword('admin123'),
      }
    ]
  };

  saveDb(initialDb);
  return initialDb;
}

export function saveDb(data: DBState): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save DB:', error);
  }
}

// DB state cache
let state: DBState = initDb();

export const db = {
  getSources: () => {
    state = initDb();
    return state.feedSources;
  },

  getSourceById: (id: string) => {
    state = initDb();
    return state.feedSources.find((s) => s.id === id);
  },

  addSource: (source: Omit<FeedSource, 'id' | 'createdAt' | 'lastFetchedAt'>) => {
    state = initDb();
    const newSource: FeedSource = {
      ...source,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastFetchedAt: null,
    };
    state.feedSources.push(newSource);
    saveDb(state);
    return newSource;
  },

  updateSource: (id: string, updates: Partial<Omit<FeedSource, 'id' | 'createdAt'>>) => {
    state = initDb();
    const index = state.feedSources.findIndex((s) => s.id === id);
    if (index !== -1) {
      state.feedSources[index] = {
        ...state.feedSources[index],
        ...updates,
      };
      saveDb(state);
      return state.feedSources[index];
    }
    return null;
  },

  deleteSource: (id: string) => {
    state = initDb();
    state.feedSources = state.feedSources.filter((s) => s.id !== id);
    state.articles = state.articles.filter((a) => a.feedSourceId !== id);
    saveDb(state);
  },

  getArticles: () => {
    state = initDb();
    return state.articles;
  },

  addArticles: (newArticles: Omit<Article, 'id' | 'createdAt'>[]) => {
    state = initDb();
    const added: Article[] = [];
    
    for (const art of newArticles) {
      // Check if duplicate by hash (link based SHA256)
      const hashId = crypto.createHash('sha256').update(art.link).digest('hex');
      const isDup = state.articles.some((a) => a.hashId === hashId || a.link === art.link);
      
      if (!isDup) {
        const fullArticle: Article = {
          ...art,
          id: generateId(),
          hashId,
          createdAt: new Date().toISOString(),
        };
        state.articles.push(fullArticle);
        added.push(fullArticle);
      }
    }

    if (added.length > 0) {
      // Sort articles by publishedAt descending, keep top 1000 to keep it clean and fast
      state.articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      if (state.articles.length > 1000) {
        state.articles = state.articles.slice(0, 1000);
      }
      saveDb(state);
    }
    return added;
  },

  clickArticle: (id: string) => {
    state = initDb();
    const article = state.articles.find((a) => a.id === id);
    if (article) {
      if (!article.clicks) {
        article.clicks = [];
      }
      article.clicks.push(new Date().toISOString());
      
      // Keep only clicks within the last 48 hours to avoid db bloat
      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      article.clicks = article.clicks.filter((c) => new Date(c).getTime() > cutoff);
      
      saveDb(state);
      return article;
    }
    return null;
  },

  getLogs: () => {
    state = initDb();
    return state.activityLogs;
  },

  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    state = initDb();
    const newLog: ActivityLog = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    state.activityLogs.unshift(newLog); // newest first
    // Limit logs to 150 entries to avoid bloating
    if (state.activityLogs.length > 150) {
      state.activityLogs = state.activityLogs.slice(0, 150);
    }
    saveDb(state);
    return newLog;
  },

  clearLogs: () => {
    state = initDb();
    state.activityLogs = [];
    saveDb(state);
  },

  getAdmins: () => {
    state = initDb();
    return state.admins;
  },

  validateAdmin: (username: string, passwordPlain: string): Admin | null => {
    state = initDb();
    const hash = hashPassword(passwordPlain);
    const matched = state.admins.find((a) => a.username === username && a.passwordHash === hash);
    return matched || null;
  }
};
