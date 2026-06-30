export interface FeedSource {
  id: string;
  name: string;
  siteUrl: string;
  feedUrl: string;
  category?: string;
  isActive: boolean;
  lastFetchedAt: string | null;
  createdAt: string;
}

export interface Article {
  id: string;
  feedSourceId: string;
  sourceName: string;
  sourceSiteUrl: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  createdAt: string;
  hashId: string;
  imageUrl?: string;
  clicks?: string[];
  category?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  sourceId: string;
  sourceName: string;
  status: 'success' | 'failed';
  message: string;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
}

export interface DBState {
  feedSources: FeedSource[];
  articles: Article[];
  activityLogs: ActivityLog[];
  admins: Admin[];
}
