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

export function updateSEO(title: string, description: string, imageUrl?: string) {
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
  setMeta('og:type', imageUrl ? 'article' : 'website', true);
  setMeta('og:url', window.location.href, true);
  setMeta('og:site_name', 'OneNationPress Sport', true);
  if (imageUrl) {
    setMeta('og:image', imageUrl, true);
  }

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  if (imageUrl) {
    setMeta('twitter:image', imageUrl);
  }
}

export function injectSchemaOrg(articles: any[], activeArticle?: any) {
  // Clean up any existing JSON-LD script
  const existingScript = document.getElementById('onenationpress-schema') || document.getElementById('nusafeed-schema');
  if (existingScript) {
    existingScript.remove();
  }

  // Create standard website/feed schema
  const websiteSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'OneNationPress Sport',
    'url': window.location.origin,
    'description': 'Portal Berita Olahraga Terintegrasi terlengkap, tercepat, dan mandiri dengan update berita olahraga terkini, jadwal, klasemen, dan live score real-time.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  if (articles && articles.length > 0) {
    websiteSchema.hasPart = articles.slice(0, 10).map((art) => ({
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
        'name': 'OneNationPress Sport',
        'logo': {
          '@type': 'ImageObject',
          'url': `${window.location.origin}/logo.png`,
        },
      },
    }));
  }

  // Create BreadcrumbList Schema
  const breadcrumbElements = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Beranda',
      'item': window.location.origin,
    }
  ];

  if (activeArticle) {
    const category = activeArticle.category || 'Olahraga';
    breadcrumbElements.push({
      '@type': 'ListItem',
      'position': 2,
      'name': category,
      'item': `${window.location.origin}/?category=${encodeURIComponent(category.toLowerCase())}`,
    });
    breadcrumbElements.push({
      '@type': 'ListItem',
      'position': 3,
      'name': activeArticle.title,
      'item': activeArticle.link || `${window.location.origin}/article/${activeArticle.id}`,
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbElements,
  };

  // We can inject them as an array of schemas in application/ld+json
  const schemaGraph = [websiteSchema, breadcrumbSchema];

  const script = document.createElement('script');
  script.id = 'onenationpress-schema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaGraph);
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
