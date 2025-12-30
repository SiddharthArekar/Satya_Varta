// API Configuration for multiple news sources
export interface ApiConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  rateLimit: number; // requests per minute
  categories: string[];
  searchSupported: boolean;
  languageSupported: boolean;
  countrySupported: boolean;
  sortSupported: boolean;
}

export const API_CONFIGS: Record<string, ApiConfig> = {
  newsapi: {
    name: 'NewsAPI',
    baseUrl: 'https://newsapi.org/v2',
    apiKey: '223fcc270f4446f4be1e1206cd5e3ffe',
    enabled: true,
    rateLimit: 1000, // 1000 requests per day for free tier
    categories: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
    searchSupported: true,
    languageSupported: true,
    countrySupported: true,
    sortSupported: true,
  },
  guardian: {
    name: 'The Guardian',
    baseUrl: 'https://content.guardianapis.com',
    apiKey: '96a17f7c-4b6e-4bc2-b97e-29887a722912',
    enabled: true,
    rateLimit: 5000, // 5000 requests per day
    categories: ['world', 'politics', 'business', 'technology', 'sport', 'culture', 'lifeandstyle', 'environment', 'health'],
    searchSupported: true,
    languageSupported: false,
    countrySupported: false,
    sortSupported: true,
  },
  nytimes: {
    name: 'New York Times',
    baseUrl: 'https://api.nytimes.com/svc',
    apiKey: 'h6ckNDC7KUEMczhXivnJt053AkFwRsjV',
    enabled: true,
    rateLimit: 1000, // 1000 requests per day
    categories: ['world', 'national', 'business', 'technology', 'sports', 'arts', 'science', 'health'],
    searchSupported: true,
    languageSupported: false,
    countrySupported: false,
    sortSupported: true,
  },
  newsdata: {
    name: 'NewsData.io',
    baseUrl: 'https://newsdata.io/api/1',
    apiKey: 'pub_6a3492455ea540c0897fc10df101f7f7',
    enabled: true,
    rateLimit: 200, // 200 requests per day for free tier
    categories: ['world', 'politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'],
    searchSupported: true,
    languageSupported: true,
    countrySupported: true,
    sortSupported: true,
  },
  gnews: {
    name: 'GNews',
    baseUrl: 'https://gnews.io/api/v4',
    apiKey: 'dc4248a8083edbc157019890436daf82',
    enabled: true,
    rateLimit: 100, // 100 requests per day for free tier
    categories: ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'],
    searchSupported: true,
    languageSupported: true,
    countrySupported: true,
    sortSupported: true,
  },
  mediastack: {
    name: 'MediaStack',
    baseUrl: 'https://api.mediastack.com/v1',
    apiKey: 'dfc69a2743105c18158c4047a457727a',
    enabled: true,
    rateLimit: 500, // 500 requests per month for free tier
    categories: ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology', 'world'],
    searchSupported: true,
    languageSupported: true,
    countrySupported: true,
    sortSupported: true,
  },
};

// Category mapping between different APIs
export const CATEGORY_MAPPING: Record<string, Record<string, string>> = {
  newsapi: {
    'world': 'general',
    'business': 'business',
    'entertainment': 'entertainment',
    'health': 'health',
    'science': 'science',
    'sports': 'sports',
    'technology': 'technology',
  },
  guardian: {
    'world': 'world',
    'business': 'business',
    'technology': 'technology',
    'sports': 'sport',
    'entertainment': 'culture',
    'health': 'health',
    'science': 'environment',
  },
  nytimes: {
    'world': 'world',
    'business': 'business',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'arts',
    'science': 'science',
    'health': 'health',
  },
  newsdata: {
    'world': 'world',
    'business': 'business',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'science': 'science',
  },
  gnews: {
    'world': 'world',
    'business': 'business',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'science': 'science',
  },
  mediastack: {
    'world': 'world',
    'business': 'business',
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'science': 'science',
  },
};

// Language codes supported by APIs
export const SUPPORTED_LANGUAGES = {
  newsapi: ['en', 'ar', 'de', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'],
  newsdata: ['en', 'ar', 'de', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'],
  guardian: ['en'], // Guardian primarily English
  nytimes: ['en'], // NYT primarily English
  gnews: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa', 'or'],
  mediastack: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa', 'or'],
};

// Country codes supported by APIs
export const SUPPORTED_COUNTRIES = {
  newsapi: ['us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'es', 'in', 'jp', 'kr', 'cn', 'br', 'mx', 'ru'],
  newsdata: ['us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'es', 'in', 'jp', 'kr', 'cn', 'br', 'mx', 'ru'],
  guardian: [], // Guardian doesn't support country filtering
  nytimes: [], // NYT doesn't support country filtering
  gnews: ['in', 'us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'es', 'jp', 'kr', 'cn', 'br', 'mx', 'ru'],
  mediastack: ['in', 'us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'es', 'jp', 'kr', 'cn', 'br', 'mx', 'ru'],
};

// Sort options supported by APIs
export const SORT_OPTIONS = {
  newsapi: ['publishedAt', 'relevancy', 'popularity'],
  guardian: ['newest', 'oldest', 'relevance'],
  nytimes: ['newest', 'oldest', 'relevance'],
  newsdata: ['published_desc', 'published_asc', 'relevance'],
  gnews: ['publishedAt', 'relevance'],
  mediastack: ['published_desc', 'published_asc', 'relevance'],
};

// Default settings
export const DEFAULT_SETTINGS = {
  language: 'en',
  country: 'in', // Prioritize Indian news
  sortBy: 'publishedAt',
  pageSize: 50, // Increased to get more articles
  maxArticles: 200, // Increased to show more news
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Max requests per minute per API
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export default API_CONFIGS;
