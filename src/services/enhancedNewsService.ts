import { NewsArticle } from "@/components/NewsCard";
import { NewsCategory } from "@/components/CategoryTabs";
import API_CONFIGS, { 
  ApiConfig, 
  CATEGORY_MAPPING, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_COUNTRIES, 
  SORT_OPTIONS,
  DEFAULT_SETTINGS 
} from "@/config/apiConfig";
import { locationService, LocationData, LocationNewsOptions } from "./locationService";

// Enhanced search and filter options
export interface NewsSearchOptions {
  query?: string;
  category?: NewsCategory;
  language?: string;
  country?: string;
  sortBy?: string;
  pageSize?: number;
  page?: number;
  fromDate?: string;
  toDate?: string;
  sources?: string[];
  domains?: string[];
  excludeDomains?: string[];
  useLocation?: boolean; // Whether to use location-based news
  locationData?: LocationData; // User's location data
}

// API response interfaces
interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: { id: string; name: string };
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
  }>;
}

interface GuardianResponse {
  response: {
    status: string;
    total: number;
    results: Array<{
      id: string;
      webTitle: string;
      webUrl: string;
      fields?: {
        thumbnail?: string;
        body?: string;
        trailText?: string;
      };
      webPublicationDate: string;
      sectionName: string;
    }>;
  };
}

interface NYTimesResponse {
  response: {
    docs: Array<{
      _id: string;
      headline: { main: string };
      abstract: string;
      web_url: string;
      multimedia: Array<{
        url: string;
        subtype: string;
      }>;
      pub_date: string;
      section_name: string;
      source: string;
    }>;
  };
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: Array<{
    article_id: string;
    title: string;
    description: string;
    link: string;
    image_url: string;
    pubDate: string;
    source_id: string;
    category: string[];
    country: string[];
    language: string;
  }>;
}

interface GNewsResponse {
  totalArticles: number;
  articles: Array<{
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
      name: string;
      url: string;
    };
  }>;
}

interface MediaStackResponse {
  data: Array<{
    title: string;
    description: string;
    url: string;
    image: string;
    published_at: string;
    source: string;
    category: string;
    country: string;
    language: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

// Rate limiting and caching
interface RateLimitInfo {
  requests: number;
  resetTime: number;
}

interface CachedNews {
  articles: NewsArticle[];
  timestamp: number;
  options: NewsSearchOptions;
  source: string;
}

class NewsServiceManager {
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private cache: Map<string, CachedNews> = new Map();
  private requestQueue: Map<string, Promise<NewsArticle[]>> = new Map();

  // Rate limiting check
  private checkRateLimit(apiName: string): boolean {
    const config = API_CONFIGS[apiName];
    if (!config) return false;

    const now = Date.now();
    const limitInfo = this.rateLimits.get(apiName);

    if (!limitInfo || now > limitInfo.resetTime) {
      this.rateLimits.set(apiName, {
        requests: 1,
        resetTime: now + (60 * 1000) // Reset every minute
      });
      return true;
    }

    if (limitInfo.requests >= config.rateLimit) {
      return false;
    }

    limitInfo.requests++;
    return true;
  }

  // Generate cache key
  private getCacheKey(options: NewsSearchOptions, source: string): string {
    return `${source}-${JSON.stringify(options)}`;
  }

  // Check cache
  private getCachedNews(options: NewsSearchOptions, source: string): NewsArticle[] | null {
    const cacheKey = this.getCacheKey(options, source);
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < DEFAULT_SETTINGS.cacheTimeout) {
      return cached.articles;
    }

    return null;
  }

  // Cache news
  private setCachedNews(options: NewsSearchOptions, articles: NewsArticle[], source: string): void {
    const cacheKey = this.getCacheKey(options, source);
    this.cache.set(cacheKey, {
      articles,
      timestamp: Date.now(),
      options,
      source
    });
  }

  // Fetch from NewsAPI
  private async fetchFromNewsAPI(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.newsapi;
    if (!config.enabled) return [];

    // Determine which endpoint to use
    const hasQuery = options.query && options.query.trim() !== '';
    const hasCategory = options.category && options.category !== 'all';
    
    // Use /top-headlines for category-specific requests without query
    // Use /everything for search queries or when no specific category
    const endpoint = (!hasQuery && hasCategory) ? '/top-headlines' : '/everything';

    const params = new URLSearchParams({
      apiKey: config.apiKey,
      language: options.language || DEFAULT_SETTINGS.language,
      pageSize: String(options.pageSize || DEFAULT_SETTINGS.pageSize),
      page: String(options.page || 1),
    });

    if (options.query) {
      params.append('q', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.newsapi[options.category] || options.category;
      params.append('category', mappedCategory);
      console.log(`NewsAPI: Mapping category ${options.category} to ${mappedCategory}`);
      
      // For category requests with top-headlines, we need a country parameter
      if (endpoint === '/top-headlines' && !options.country) {
        params.append('country', 'us'); // Default to US if no country specified
      }
    }

    if (options.country) {
      params.append('country', options.country);
    }

    if (options.sortBy) {
      params.append('sortBy', options.sortBy);
    }

    if (options.fromDate) {
      params.append('from', options.fromDate);
    }

    if (options.toDate) {
      params.append('to', options.toDate);
    }

    if (options.sources && options.sources.length > 0) {
      params.append('sources', options.sources.join(','));
    }

    const fullUrl = `${config.baseUrl}${endpoint}?${params}`;
    console.log(`NewsAPI request URL:`, fullUrl);
    
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);

    const data: NewsApiResponse = await response.json();
    if (data.status !== 'ok') throw new Error('NewsAPI returned error');
    
    console.log(`NewsAPI response for category ${options.category}:`, {
      endpoint,
      category: options.category,
      totalResults: data.totalResults,
      articlesCount: data.articles?.length || 0
    });

    return data.articles.map(article => {
      const optimizedImageUrl = this.optimizeImageUrl(article.urlToImage);
      return {
        id: `newsapi-${article.url}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        imageUrl: optimizedImageUrl || this.getFallbackImage(options.category || 'world'),
        publishedAt: article.publishedAt,
        source: article.source.name,
        category: options.category || this.mapCategoryFromNewsAPI(article.source.id),
        isBookmarked: false
      };
    });
  }

  // Fetch from Guardian API
  private async fetchFromGuardian(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.guardian;
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      'api-key': config.apiKey,
      'page-size': String(options.pageSize || DEFAULT_SETTINGS.pageSize),
      'page': String(options.page || 1),
      'show-fields': 'thumbnail,body,trailText',
    });

    if (options.query) {
      params.append('q', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.guardian[options.category] || options.category;
      params.append('section', mappedCategory);
      console.log(`Guardian: Mapping category ${options.category} to ${mappedCategory}`);
    }

    if (options.fromDate) {
      params.append('from-date', options.fromDate);
    }

    if (options.toDate) {
      params.append('to-date', options.toDate);
    }

    if (options.sortBy) {
      const sortMap: Record<string, string> = {
        'publishedAt': 'newest',
        'relevancy': 'relevance',
        'popularity': 'newest'
      };
      params.append('order-by', sortMap[options.sortBy] || 'newest');
    }

    const response = await fetch(`${config.baseUrl}/search?${params}`);
    if (!response.ok) throw new Error(`Guardian API error: ${response.status}`);

    const data: GuardianResponse = await response.json();
    if (data.response.status !== 'ok') throw new Error('Guardian API returned error');

    return data.response.results.map(article => {
      const optimizedImageUrl = this.optimizeImageUrl(article.fields?.thumbnail);
      return {
        id: `guardian-${article.id}`,
        title: article.webTitle,
        description: article.fields?.trailText || 'No description available',
        url: article.webUrl,
        imageUrl: optimizedImageUrl || this.getFallbackImage('world'),
        publishedAt: article.webPublicationDate,
        source: 'The Guardian',
        category: this.mapCategoryFromGuardian(article.sectionName),
        isBookmarked: false
      };
    });
  }

  // Fetch from NY Times API
  private async fetchFromNYTimes(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.nytimes;
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      'api-key': config.apiKey,
      'page': String(options.page || 0),
    });

    if (options.query) {
      params.append('q', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.nytimes[options.category] || options.category;
      params.append('fq', `section_name:("${mappedCategory}")`);
      console.log(`NYTimes: Mapping category ${options.category} to ${mappedCategory}`);
    }

    if (options.fromDate) {
      params.append('begin_date', options.fromDate.replace(/-/g, ''));
    }

    if (options.toDate) {
      params.append('end_date', options.toDate.replace(/-/g, ''));
    }

    if (options.sortBy) {
      const sortMap: Record<string, string> = {
        'publishedAt': 'newest',
        'relevancy': 'relevance',
        'popularity': 'newest'
      };
      params.append('sort', sortMap[options.sortBy] || 'newest');
    }

    const response = await fetch(`${config.baseUrl}/search/v2/articlesearch.json?${params}`);
    if (!response.ok) throw new Error(`NY Times API error: ${response.status}`);

    const data: NYTimesResponse = await response.json();

    return data.response.docs.map(article => {
      const imageUrl = article.multimedia?.find(img => img.subtype === 'thumbnail')?.url;
      const fullImageUrl = imageUrl ? `https://www.nytimes.com/${imageUrl}` : null;
      const optimizedImageUrl = this.optimizeImageUrl(fullImageUrl);
      return {
        id: `nytimes-${article._id}`,
        title: article.headline.main,
        description: article.abstract || 'No description available',
        url: article.web_url,
        imageUrl: optimizedImageUrl || this.getFallbackImage('world'),
        publishedAt: article.pub_date,
        source: 'The New York Times',
        category: this.mapCategoryFromNYTimes(article.section_name),
        isBookmarked: false
      };
    });
  }

  // Fetch from NewsData API
  private async fetchFromNewsData(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.newsdata;
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      apikey: config.apiKey,
      language: options.language || DEFAULT_SETTINGS.language,
      size: String(options.pageSize || DEFAULT_SETTINGS.pageSize),
      page: String(options.page || 1),
    });

    if (options.query) {
      params.append('q', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.newsdata[options.category] || options.category;
      params.append('category', mappedCategory);
      console.log(`NewsData: Mapping category ${options.category} to ${mappedCategory}`);
    }

    if (options.country) {
      params.append('country', options.country);
    }

    if (options.fromDate) {
      params.append('from_date', options.fromDate);
    }

    if (options.toDate) {
      params.append('to_date', options.toDate);
    }

    if (options.domains && options.domains.length > 0) {
      params.append('domain', options.domains.join(','));
    }

    if (options.excludeDomains && options.excludeDomains.length > 0) {
      params.append('exclude_domain', options.excludeDomains.join(','));
    }

    const response = await fetch(`${config.baseUrl}/news?${params}`);
    if (!response.ok) throw new Error(`NewsData API error: ${response.status}`);

    const data: NewsDataResponse = await response.json();
    if (data.status === 'error') throw new Error('NewsData API returned error');

    return data.results.map(article => {
      const optimizedImageUrl = this.optimizeImageUrl(article.image_url);
      return {
        id: `newsdata-${article.article_id}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.link,
        imageUrl: optimizedImageUrl || this.getFallbackImage('world'),
        publishedAt: article.pubDate,
        source: article.source_id,
        category: this.mapCategoryFromNewsData(article.category?.[0]),
        isBookmarked: false
      };
    });
  }

  // Fetch from GNews API
  private async fetchFromGNews(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.gnews;
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      token: config.apiKey,
      lang: options.language || DEFAULT_SETTINGS.language,
      max: String(options.pageSize || DEFAULT_SETTINGS.pageSize),
      country: options.country || 'in', // Default to India
    });

    if (options.query) {
      params.append('q', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.gnews[options.category] || options.category;
      params.append('topic', mappedCategory);
    }

    if (options.fromDate) {
      params.append('from', options.fromDate);
    }

    if (options.toDate) {
      params.append('to', options.toDate);
    }

    const fullUrl = `${config.baseUrl}/search?${params}`;
    console.log(`GNews request URL:`, fullUrl);
    
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`GNews API error: ${response.status}`);

    const data: GNewsResponse = await response.json();
    
    console.log(`GNews response for category ${options.category}:`, {
      category: options.category,
      totalArticles: data.totalArticles,
      articlesCount: data.articles?.length || 0
    });

    return data.articles.map(article => {
      const optimizedImageUrl = this.optimizeImageUrl(article.image);
      return {
        id: `gnews-${article.url}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        imageUrl: optimizedImageUrl || this.getFallbackImage(options.category || 'world'),
        publishedAt: article.publishedAt,
        source: article.source.name,
        category: options.category || this.mapCategoryFromGNews(article.source.name),
        isBookmarked: false
      };
    });
  }

  // Fetch from MediaStack API
  private async fetchFromMediaStack(options: NewsSearchOptions): Promise<NewsArticle[]> {
    const config = API_CONFIGS.mediastack;
    if (!config.enabled) return [];

    const params = new URLSearchParams({
      access_key: config.apiKey,
      languages: options.language || DEFAULT_SETTINGS.language,
      limit: String(options.pageSize || DEFAULT_SETTINGS.pageSize),
      countries: options.country || 'in', // Default to India
    });

    if (options.query) {
      params.append('keywords', options.query);
    }

    if (options.category && options.category !== 'all') {
      const mappedCategory = CATEGORY_MAPPING.mediastack[options.category] || options.category;
      params.append('categories', mappedCategory);
    }

    if (options.fromDate) {
      params.append('date', options.fromDate);
    }

    if (options.sortBy) {
      params.append('sort', options.sortBy);
    }

    const fullUrl = `${config.baseUrl}/news?${params}`;
    console.log(`MediaStack request URL:`, fullUrl);
    
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`MediaStack API error: ${response.status}`);

    const data: MediaStackResponse = await response.json();
    
    console.log(`MediaStack response for category ${options.category}:`, {
      category: options.category,
      total: data.pagination?.total || 0,
      articlesCount: data.data?.length || 0
    });

    return data.data.map(article => {
      const optimizedImageUrl = this.optimizeImageUrl(article.image);
      return {
        id: `mediastack-${article.url}`,
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        imageUrl: optimizedImageUrl || this.getFallbackImage(options.category || 'world'),
        publishedAt: article.published_at,
        source: article.source,
        category: options.category || this.mapCategoryFromMediaStack(article.category),
        isBookmarked: false
      };
    });
  }

  // Category mapping functions
  private mapCategoryFromNewsAPI(sourceId: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'bbc-news': 'world',
      'cnn': 'world',
      'reuters': 'world',
      'bloomberg': 'business',
      'business-insider': 'business',
      'techcrunch': 'technology',
      'engadget': 'technology',
      'espn': 'sports',
      'bleacher-report': 'sports',
      'entertainment-weekly': 'entertainment',
      'buzzfeed': 'entertainment',
      'medical-news-today': 'health',
      'webmd': 'health',
      'national-geographic': 'science',
      'new-scientist': 'science',
    };
    return mapping[sourceId] || 'world';
  }

  private mapCategoryFromGuardian(sectionName: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'world': 'world',
      'politics': 'world',
      'business': 'business',
      'technology': 'technology',
      'sport': 'sports',
      'culture': 'entertainment',
      'lifeandstyle': 'health',
      'health': 'health',
      'environment': 'science',
    };
    return mapping[sectionName.toLowerCase()] || 'world';
  }

  private mapCategoryFromNYTimes(sectionName: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'world': 'world',
      'national': 'world',
      'business': 'business',
      'technology': 'technology',
      'sports': 'sports',
      'arts': 'entertainment',
      'science': 'science',
      'health': 'health',
    };
    return mapping[sectionName.toLowerCase()] || 'world';
  }

  private mapCategoryFromNewsData(category: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'world': 'world',
      'politics': 'world',
      'business': 'business',
      'technology': 'technology',
      'sports': 'sports',
      'entertainment': 'entertainment',
      'health': 'health',
      'science': 'science',
    };
    return mapping[category?.toLowerCase()] || 'world';
  }

  private mapCategoryFromGNews(sourceName: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'times of india': 'world',
      'the hindu': 'world',
      'hindustan times': 'world',
      'indian express': 'world',
      'business standard': 'business',
      'economic times': 'business',
      'livemint': 'business',
      'techcrunch india': 'technology',
      'gadgets 360': 'technology',
      'sports star': 'sports',
      'espn india': 'sports',
      'bollywood hungama': 'entertainment',
      'filmfare': 'entertainment',
      'times of india health': 'health',
      'webmd india': 'health',
    };
    return mapping[sourceName?.toLowerCase()] || 'world';
  }

  private mapCategoryFromMediaStack(category: string): NewsCategory {
    const mapping: Record<string, NewsCategory> = {
      'general': 'world',
      'business': 'business',
      'entertainment': 'entertainment',
      'health': 'health',
      'science': 'science',
      'sports': 'sports',
      'technology': 'technology',
      'world': 'world',
    };
    return mapping[category?.toLowerCase()] || 'world';
  }

  // Enhanced image URL validation and optimization
  private optimizeImageUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === '') return null;
    
    try {
      const parsedUrl = new URL(url);
      
      // Skip common placeholder/fallback URLs
      const skipPatterns = [
        'placeholder',
        'default',
        'fallback',
        'no-image',
        'missing',
        'broken',
        'error',
        'null',
        'undefined'
      ];
      
      const urlLower = url.toLowerCase();
      if (skipPatterns.some(pattern => urlLower.includes(pattern))) {
        return null;
      }
      
      // Optimize image URLs for better loading
      if (parsedUrl.hostname.includes('unsplash.com')) {
        // Add size parameters for Unsplash images
        parsedUrl.searchParams.set('w', '500');
        parsedUrl.searchParams.set('h', '300');
        parsedUrl.searchParams.set('fit', 'crop');
        parsedUrl.searchParams.set('q', '80');
      }
      
      return parsedUrl.toString();
    } catch {
      return null;
    }
  }

  // Fallback image generator
  private getFallbackImage(category: NewsCategory): string {
    const fallbackImages: Record<NewsCategory, string[]> = {
      world: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60'
      ],
      business: [
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60'
      ],
      technology: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60'
      ],
      sports: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60'
      ],
      entertainment: [
        'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60'
      ],
      health: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60'
      ],
      science: [
        'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60'
      ],
      all: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60'
      ]
    };

    const images = fallbackImages[category] || fallbackImages.all;
    return images[Math.floor(Math.random() * images.length)];
  }

  // Optimized deduplication with better performance
  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const uniqueArticles: NewsArticle[] = [];

    for (const article of articles) {
      // Check for exact ID match
      if (seenIds.has(article.id)) continue;
      
      // Check for similar titles (normalized comparison)
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (seenTitles.has(normalizedTitle)) continue;
      
      seenIds.add(article.id);
      seenTitles.add(normalizedTitle);
      uniqueArticles.push(article);
    }

    return uniqueArticles;
  }

  // Main fetch method with fallback and aggregation
  public async fetchNews(options: NewsSearchOptions = {}): Promise<NewsArticle[]> {
    // Get user's location if location-based news is requested
    if (options.useLocation && !options.locationData) {
      try {
        const location = await locationService.getCurrentLocation();
        if (location) {
          options.locationData = location;
          // Update country and language based on location
          if (!options.country) {
            options.country = location.countryCode;
          }
          if (!options.language) {
            options.language = this.getLanguageFromCountry(location.countryCode);
          }
        }
      } catch (error) {
        console.error('Error getting location for news:', error);
      }
    }

    // Prioritize Indian news APIs
    const indianAPIs = ['gnews', 'mediastack', 'newsdata'];
    const otherAPIs = Object.entries(API_CONFIGS)
      .filter(([name, config]) => config.enabled && !indianAPIs.includes(name))
      .map(([name, _]) => name);
    
    const enabledAPIs = [
      ...indianAPIs.filter(api => API_CONFIGS[api]?.enabled),
      ...otherAPIs
    ];

    if (enabledAPIs.length === 0) {
      return this.getFallbackNews(options.category);
    }

    const promises: Promise<NewsArticle[]>[] = [];
    const results: NewsArticle[] = [];

    // Try each API with rate limiting
    for (const apiName of enabledAPIs) {
      if (!this.checkRateLimit(apiName)) {
        console.warn(`Rate limit exceeded for ${apiName}, skipping`);
        continue;
      }

      // Check cache first
      const cached = this.getCachedNews(options, apiName);
      if (cached) {
        results.push(...cached);
        continue;
      }

      // Add to request queue to prevent duplicate requests
      const cacheKey = this.getCacheKey(options, apiName);
      if (this.requestQueue.has(cacheKey)) {
        promises.push(this.requestQueue.get(cacheKey)!);
        continue;
      }

      const promise = this.fetchFromAPI(apiName, options);
      this.requestQueue.set(cacheKey, promise);

      promise.finally(() => {
        this.requestQueue.delete(cacheKey);
      });

      promises.push(promise);
    }

    try {
      const apiResults = await Promise.allSettled(promises);
      
      for (const result of apiResults) {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.error('API request failed:', result.reason);
        }
      }

      // Deduplicate and sort
      const uniqueArticles = this.deduplicateArticles(results);
      const sortedArticles = uniqueArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      return sortedArticles.slice(0, options.pageSize || DEFAULT_SETTINGS.maxArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getFallbackNews(options.category);
    }
  }

  // Fetch from specific API
  private async fetchFromAPI(apiName: string, options: NewsSearchOptions): Promise<NewsArticle[]> {
    try {
      let articles: NewsArticle[] = [];

      console.log(`Fetching from ${apiName} for category: ${options.category}, query: ${options.query}`);

      switch (apiName) {
        case 'newsapi':
          articles = await this.fetchFromNewsAPI(options);
          break;
        case 'guardian':
          articles = await this.fetchFromGuardian(options);
          break;
        case 'nytimes':
          articles = await this.fetchFromNYTimes(options);
          break;
        case 'newsdata':
          articles = await this.fetchFromNewsData(options);
          break;
        case 'gnews':
          articles = await this.fetchFromGNews(options);
          break;
        case 'mediastack':
          articles = await this.fetchFromMediaStack(options);
          break;
        default:
          throw new Error(`Unknown API: ${apiName}`);
      }

      console.log(`${apiName} returned ${articles.length} articles`);

      // Cache the results
      this.setCachedNews(options, articles, apiName);
      return articles;
    } catch (error) {
      console.error(`Error fetching from ${apiName} for category ${options.category}:`, error);
      // Return empty array instead of throwing to allow other APIs to try
      return [];
    }
  }

  // Fallback news data
  private getFallbackNews(category: NewsCategory = 'all'): NewsArticle[] {
    const fallbackArticles: NewsArticle[] = [
      {
        id: 'fallback-1',
        title: 'India\'s Tech Sector Shows Strong Growth in Q4',
        description: 'Indian technology companies report significant growth with new investments and job creation across major cities.',
        url: 'https://example.com/india-tech-growth',
        imageUrl: this.getFallbackImage('technology'),
        publishedAt: new Date().toISOString(),
        source: 'Times of India',
        category: 'technology',
        isBookmarked: false
      },
      {
        id: 'fallback-2',
        title: 'India and Global Partners Sign Climate Agreement',
        description: 'India joins world leaders in signing a landmark climate change agreement at the latest international summit.',
        url: 'https://example.com/india-climate-agreement',
        imageUrl: this.getFallbackImage('world'),
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'The Hindu',
        category: 'world',
        isBookmarked: false
      },
      {
        id: 'fallback-3',
        title: 'Indian Stock Market Reaches New Heights',
        description: 'BSE and NSE indices show strong performance with significant gains in key sectors including IT and banking.',
        url: 'https://example.com/indian-stock-market',
        imageUrl: this.getFallbackImage('business'),
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Economic Times',
        category: 'business',
        isBookmarked: false
      },
      {
        id: 'fallback-4',
        title: 'Indian Athletes Prepare for Asian Games',
        description: 'Indian athletes are training hard for the upcoming Asian Games with high hopes for medal success.',
        url: 'https://example.com/indian-athletes-asian-games',
        imageUrl: this.getFallbackImage('sports'),
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'Sports Star',
        category: 'sports',
        isBookmarked: false
      },
      {
        id: 'fallback-5',
        title: 'AIIMS Research Team Makes Medical Breakthrough',
        description: 'Researchers at AIIMS have published findings that could lead to new treatments for diabetes and heart disease.',
        url: 'https://example.com/aiims-medical-research',
        imageUrl: this.getFallbackImage('health'),
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'Times of India Health',
        category: 'health',
        isBookmarked: false
      },
      {
        id: 'fallback-6',
        title: 'Hollywood Blockbuster Breaks Box Office Records',
        description: 'The latest superhero movie has become the highest-grossing film of the year, surpassing all expectations.',
        url: 'https://example.com/box-office-record',
        imageUrl: this.getFallbackImage('entertainment'),
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: 'Entertainment Weekly',
        category: 'entertainment',
        isBookmarked: false
      },
      {
        id: 'fallback-7',
        title: 'Major Music Festival Announces Star-Studded Lineup',
        description: 'The annual summer music festival has revealed an impressive lineup featuring top artists from around the world.',
        url: 'https://example.com/music-festival',
        imageUrl: this.getFallbackImage('entertainment'),
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: 'Music News',
        category: 'entertainment',
        isBookmarked: false
      },
      {
        id: 'fallback-8',
        title: 'Streaming Service Announces New Original Series',
        description: 'A popular streaming platform has announced several new original series coming this year.',
        url: 'https://example.com/streaming-series',
        imageUrl: this.getFallbackImage('entertainment'),
        publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        source: 'Streaming News',
        category: 'entertainment',
        isBookmarked: false
      },
      // Additional sports articles
      {
        id: 'fallback-9',
        title: 'Championship Finals Set for Next Weekend',
        description: 'The final match of the championship tournament has been scheduled for next weekend with record attendance expected.',
        url: 'https://example.com/championship-finals',
        imageUrl: this.getFallbackImage('sports'),
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        source: 'Sports Central',
        category: 'sports',
        isBookmarked: false
      },
      {
        id: 'fallback-10',
        title: 'Olympic Athlete Breaks World Record',
        description: 'An Olympic athlete has set a new world record in their discipline, surpassing the previous record by a significant margin.',
        url: 'https://example.com/world-record',
        imageUrl: this.getFallbackImage('sports'),
        publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        source: 'Olympic News',
        category: 'sports',
        isBookmarked: false
      },
      // Additional health articles
      {
        id: 'fallback-11',
        title: 'New Vaccine Shows Promising Results in Trials',
        description: 'A new vaccine has shown encouraging results in clinical trials, offering hope for improved public health outcomes.',
        url: 'https://example.com/new-vaccine',
        imageUrl: this.getFallbackImage('health'),
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: 'Health Research',
        category: 'health',
        isBookmarked: false
      },
      {
        id: 'fallback-12',
        title: 'Mental Health Awareness Campaign Launches',
        description: 'A new nationwide campaign aims to raise awareness about mental health issues and provide resources for those in need.',
        url: 'https://example.com/mental-health-campaign',
        imageUrl: this.getFallbackImage('health'),
        publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        source: 'Mental Health Foundation',
        category: 'health',
        isBookmarked: false
      },
      // Additional entertainment articles
      {
        id: 'fallback-13',
        title: 'Award-Winning Film Director Announces New Project',
        description: 'An acclaimed film director has revealed details about their upcoming project, which is already generating significant buzz.',
        url: 'https://example.com/director-new-project',
        imageUrl: this.getFallbackImage('entertainment'),
        publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        source: 'Cinema News',
        category: 'entertainment',
        isBookmarked: false
      },
      {
        id: 'fallback-14',
        title: 'Popular Music Artist Releases Surprise Album',
        description: 'A beloved music artist has unexpectedly released a new album, delighting fans worldwide with fresh material.',
        url: 'https://example.com/surprise-album',
        imageUrl: this.getFallbackImage('entertainment'),
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        source: 'Music Weekly',
        category: 'entertainment',
        isBookmarked: false
      }
    ];

    if (category !== 'all') {
      return fallbackArticles.filter(article => article.category === category);
    }

    return fallbackArticles;
  }

  // Search news with advanced filters
  public async searchNews(query: string, options: NewsSearchOptions = {}): Promise<NewsArticle[]> {
    return this.fetchNews({ ...options, query });
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Get language from country code
  private getLanguageFromCountry(countryCode: string): string {
    const languageMapping: Record<string, string> = {
      'us': 'en',
      'gb': 'en',
      'ca': 'en',
      'au': 'en',
      'de': 'de',
      'fr': 'fr',
      'it': 'it',
      'es': 'es',
      'in': 'en',
      'jp': 'ja',
      'kr': 'ko',
      'cn': 'zh',
      'br': 'pt',
      'mx': 'es',
      'ru': 'ru'
    };

    return languageMapping[countryCode] || 'en';
  }

  // Get API status
  public getAPIStatus(): Record<string, { enabled: boolean; rateLimit: number; requests: number }> {
    const status: Record<string, { enabled: boolean; rateLimit: number; requests: number }> = {};
    
    for (const [name, config] of Object.entries(API_CONFIGS)) {
      const limitInfo = this.rateLimits.get(name);
      status[name] = {
        enabled: config.enabled,
        rateLimit: config.rateLimit,
        requests: limitInfo?.requests || 0
      };
    }

    return status;
  }
}

// Create singleton instance
const newsServiceManager = new NewsServiceManager();

// Export functions for backward compatibility
export const fetchNews = async (
  category: NewsCategory = 'all',
  query?: string,
  useLocation: boolean = false
): Promise<NewsArticle[]> => {
  return newsServiceManager.fetchNews({
    category,
    query,
    language: DEFAULT_SETTINGS.language,
    country: DEFAULT_SETTINGS.country,
    sortBy: DEFAULT_SETTINGS.sortBy,
    pageSize: DEFAULT_SETTINGS.pageSize,
    useLocation
  });
};

// New function for location-based news
export const fetchLocationNews = async (
  category: NewsCategory = 'all',
  query?: string
): Promise<NewsArticle[]> => {
  return newsServiceManager.fetchNews({
    category,
    query,
    language: DEFAULT_SETTINGS.language,
    country: DEFAULT_SETTINGS.country,
    sortBy: DEFAULT_SETTINGS.sortBy,
    pageSize: DEFAULT_SETTINGS.pageSize,
    useLocation: true
  });
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  return newsServiceManager.searchNews(query);
};

export const clearNewsCache = (): void => {
  newsServiceManager.clearCache();
};

export const getAPIStatus = () => {
  return newsServiceManager.getAPIStatus();
};

// Export the manager for advanced usage
export { newsServiceManager };

// Legacy functions for backward compatibility
export const clearImageCache = (): void => {
  // This function is now handled internally by the service
  console.log('Image cache clearing is now handled automatically by the news service');
};
