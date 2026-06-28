import Parser from 'rss-parser';
import { db } from './db.js';
import { Article } from './types.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  timeout: 10000,
});

// Helper to strip HTML tags from a string
export function stripHtml(html: string): string {
  if (!html) return '';
  // Replace HTML tags with spaces
  let text = html.replace(/<[^>]*>/g, ' ');
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Clean up extra spacing
  return text.replace(/\s+/g, ' ').trim();
}

export async function fetchActiveFeeds(): Promise<{ totalFetched: number; results: { sourceName: string; count: number; status: string; error?: string }[] }> {
  const sources = db.getSources().filter((s) => s.isActive);
  let totalFetched = 0;
  const results: { sourceName: string; count: number; status: string; error?: string }[] = [];

  for (const source of sources) {
    try {
      console.log(`Fetching feed for: ${source.name} (${source.feedUrl})`);
      const feed = await parser.parseURL(source.feedUrl);
      
      const articlesToSave: Omit<Article, 'id' | 'createdAt'>[] = [];
      const items = feed.items || [];

      for (const item of items) {
        if (!item.title || !item.link) continue;

        // Clean up title and summary
        const cleanTitle = stripHtml(item.title);
        let rawSummary = item.contentSnippet || item.content || item.summary || item.description || '';
        let cleanSummary = stripHtml(rawSummary);

        // Truncate summary to 750 characters with trailing ellipsis
        if (cleanSummary.length > 750) {
          cleanSummary = cleanSummary.substring(0, 747) + '...';
        }

        // Parse and validate date
        let publishedAt = new Date().toISOString();
        if (item.pubDate || item.isoDate) {
          const parsedDate = new Date(item.pubDate || item.isoDate || '');
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.toISOString();
          }
        }

        // Extract Image URL if available
        let imageUrl: string | undefined = undefined;

        // 1. Try enclosure
        if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url;
        }

        // 2. Try media properties
        if (!imageUrl && (item as any)['media:content']?.['$']?.url) {
          imageUrl = (item as any)['media:content']?.['$']?.url;
        } else if (!imageUrl && (item as any).mediaContent?.url) {
          imageUrl = (item as any).mediaContent.url;
        } else if (!imageUrl && (item as any)['media:thumbnail']?.['$']?.url) {
          imageUrl = (item as any)['media:thumbnail']?.['$']?.url;
        }

        // 3. Try HTML parsing
        if (!imageUrl) {
          const htmlContent = item.content || item.description || '';
          const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
          const match = htmlContent.match(imgRegex);
          if (match && match[1]) {
            imageUrl = match[1];
          }
        }

        articlesToSave.push({
          feedSourceId: source.id,
          sourceName: source.name,
          sourceSiteUrl: source.siteUrl,
          title: cleanTitle,
          summary: cleanSummary,
          link: item.link,
          publishedAt,
          hashId: '', // calculated in db.addArticles
          imageUrl,
        });
      }

      const added = db.addArticles(articlesToSave);
      totalFetched += added.length;

      // Update feed last fetched timestamp
      db.updateSource(source.id, { lastFetchedAt: new Date().toISOString() });

      // Log success
      db.addLog({
        sourceId: source.id,
        sourceName: source.name,
        status: 'success',
        message: `Berhasil mengambil ${added.length} artikel baru (Total feed: ${items.length}).`,
      });

      results.push({
        sourceName: source.name,
        count: added.length,
        status: 'success',
      });
    } catch (err: any) {
      console.error(`Error fetching feed for ${source.name}:`, err.message || err);
      
      // Log failure
      db.addLog({
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        message: `Gagal mengambil data: ${err.message || 'Error tidak diketahui'}`,
      });

      results.push({
        sourceName: source.name,
        count: 0,
        status: 'failed',
        error: err.message || 'Error tidak diketahui',
      });
    }
  }

  return { totalFetched, results };
}

export async function discoverFeedUrl(siteUrl: string): Promise<{ feedUrl: string; title: string } | null> {
  // Ensure we have a valid URL format
  let url = siteUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat situs (HTTP ${response.status})`);
    }

    const html = await response.text();
    
    // Parse link elements to discover feeds
    const linkMatches = html.match(/<link\s+[^>]+>/gi) || [];
    for (const link of linkMatches) {
      const typeMatch = link.match(/type=["'](application\/(rss\+xml|atom\+xml|xml)|text\/xml)["']/i);
      const relMatch = link.match(/rel=["']alternate["']/i);
      
      if (typeMatch && relMatch) {
        const hrefMatch = link.match(/href=["']([^"']+)["']/i);
        if (hrefMatch && hrefMatch[1]) {
          let discoveredUrl = hrefMatch[1];
          // Handle relative URLs
          if (discoveredUrl.startsWith('/')) {
            const u = new URL(url);
            discoveredUrl = `${u.protocol}//${u.host}${discoveredUrl}`;
          } else if (!discoveredUrl.startsWith('http')) {
            discoveredUrl = new URL(discoveredUrl, url).toString();
          }

          // Test if we can parse it
          try {
            const testFeed = await parser.parseURL(discoveredUrl);
            return {
              feedUrl: discoveredUrl,
              title: testFeed.title || new URL(url).hostname,
            };
          } catch (e) {
            // Suppress error and continue searching
          }
        }
      }
    }

    // Try common feed pathways as fallback
    const commonPaths = ['/feed', '/rss', '/rss.xml', '/feed.xml', '/index.xml', '/atom.xml'];
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, url).toString();
        const testFeed = await parser.parseURL(testUrl);
        return {
          feedUrl: testUrl,
          title: testFeed.title || new URL(url).hostname,
        };
      } catch (e) {
        // Suppress and continue
      }
    }
  } catch (error) {
    console.error('Discover error:', error);
  }

  // If input URL is already a parseable feed, return it directly
  try {
    const directFeed = await parser.parseURL(url);
    return {
      feedUrl: url,
      title: directFeed.title || new URL(url).hostname,
    };
  } catch (e) {
    // Fails
  }

  return null;
}
