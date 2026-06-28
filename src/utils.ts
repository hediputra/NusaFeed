export function getRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now.getTime() - published.getTime();
    
    if (isNaN(diffMs) || diffMs < 0) {
      return 'Baru saja';
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 30) return `${diffDays} hari yang lalu`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;

    return published.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) {
    return 'Beberapa waktu lalu';
  }
}

export function updateSEO(title: string, description: string) {
  // Update browser title
  document.title = title;

  // Helper to update meta tag
  const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, nameOrProperty);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('description', description);

  // Open Graph
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:type', 'website', true);
  setMeta('og:url', window.location.href, true);
  setMeta('og:site_name', 'NusaFeed', true);

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
}

export function injectSchemaOrg(articles: any[]) {
  // Clean up any existing JSON-LD script
  const existingScript = document.getElementById('nusafeed-schema');
  if (existingScript) {
    existingScript.remove();
  }

  // Create standard schema
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'NusaFeed - Agregator & Jadwal Olahraga',
    'url': window.location.origin,
    'description': 'Agregator berita dan jadwal olahraga nasional serta internasional terlengkap, tercepat, dan mandiri.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // If we have articles, add them as part of a NewsMediaOrganization / Feed list
  if (articles && articles.length > 0) {
    schema.hasPart = articles.slice(0, 10).map((art) => ({
      '@type': 'NewsArticle',
      'headline': art.title,
      'description': art.summary,
      'url': art.link,
      'datePublished': art.publishedAt,
      'author': {
        '@type': 'Organization',
        'name': art.sourceName,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'NusaFeed',
        'logo': {
          '@type': 'ImageObject',
          'url': `${window.location.origin}/logo.png`,
        },
      },
    }));
  }

  const script = document.createElement('script');
  script.id = 'nusafeed-schema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

export function getArticleFallbackImage(category?: string): string {
  const cat = (category || 'nasional').toLowerCase();
  switch (cat) {
    case 'politik':
      return 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80';
    case 'ekonomi':
    case 'bisnis':
      return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80';
    case 'teknologi':
    case 'sains':
      return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80';
    case 'olahraga':
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
    case 'hiburan':
    case 'film':
    case 'musik':
      return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
    case 'kesehatan':
      return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80';
    case 'gaya hidup':
    case 'lifestyle':
    case 'kuliner':
    case 'wisata':
      return 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80';
    case 'internasional':
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
  }
}
