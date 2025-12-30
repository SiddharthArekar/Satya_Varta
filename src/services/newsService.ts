import { NewsArticle } from "@/components/NewsCard";
import { NewsCategory } from "@/components/CategoryTabs";
import { 
  fetchNews as enhancedFetchNews, 
  searchNews as enhancedSearchNews, 
  clearNewsCache as enhancedClearNewsCache,
  clearImageCache as enhancedClearImageCache,
  getAPIStatus
} from "./enhancedNewsService";

interface NewsApiResponse {
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
  }>;
}

const categoryMap: Record<string, NewsCategory> = {
  'world': 'world',
  'politics': 'world',
  'business': 'business',
  'technology': 'technology',
  'sports': 'sports',
  'entertainment': 'entertainment',
  'health': 'health',
  'science': 'science',
  'top': 'all'
};

// Fallback images for different categories
const fallbackImages = {
  'world': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'business': [
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'technology': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'sports': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'entertainment': [
    'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'health': [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ],
  'science': [
    'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  ]
};

// Track used images to prevent duplicates
const usedImages = new Set<string>();
const imageCounter = new Map<string, number>();

// Function to get a unique fallback image
const getUniqueFallbackImage = (category: string): string => {
  const categoryImages = fallbackImages[category as keyof typeof fallbackImages] || fallbackImages['world'];
  const counter = imageCounter.get(category) || 0;
  const imageIndex = counter % categoryImages.length;
  imageCounter.set(category, counter + 1);
  return categoryImages[imageIndex];
};

// Function to validate and get unique image URL
const getUniqueImageUrl = (originalUrl: string | null, category: string, articleId: string): string => {
  // If no original URL or it's already used, get a unique fallback
  if (!originalUrl || usedImages.has(originalUrl)) {
    const fallbackImage = getUniqueFallbackImage(category);
    usedImages.add(fallbackImage);
    return fallbackImage;
  }
  
  // Validate the original URL
  try {
    const url = new URL(originalUrl);
    // Check if it's a valid image URL
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      usedImages.add(originalUrl);
      return originalUrl;
    }
  } catch {
    // Invalid URL, use fallback
  }
  
  const fallbackImage = getUniqueFallbackImage(category);
  usedImages.add(fallbackImage);
  return fallbackImage;
};

// Function to remove duplicates based on title similarity
const removeDuplicates = (articles: NewsArticle[]): NewsArticle[] => {
  const seen = new Set<string>();
  const uniqueArticles: NewsArticle[] = [];
  
  for (const article of articles) {
    // Create a normalized title for comparison
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Check if we've seen this title before
    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle);
      uniqueArticles.push(article);
    }
  }
  
  return uniqueArticles;
};

// Fallback news data for when API is unavailable
const getFallbackNews = (category: NewsCategory = 'all'): NewsArticle[] => {
  const fallbackArticles: NewsArticle[] = [
    {
      id: 'fallback-1',
      title: 'Breaking: Major Technology Breakthrough Announced',
      description: 'Scientists have made a significant breakthrough in quantum computing that could revolutionize the industry.',
      url: 'https://example.com/tech-breakthrough',
      imageUrl: getUniqueFallbackImage('technology'),
      publishedAt: new Date().toISOString(),
      source: 'Tech News',
      category: 'technology',
      isBookmarked: false
    },
    {
      id: 'fallback-2',
      title: 'Global Climate Summit Reaches Historic Agreement',
      description: 'World leaders have reached a landmark agreement on climate change measures at the latest summit.',
      url: 'https://example.com/climate-summit',
      imageUrl: getUniqueFallbackImage('world'),
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Global News',
      category: 'world',
      isBookmarked: false
    },
    {
      id: 'fallback-3',
      title: 'Stock Market Shows Strong Performance',
      description: 'Major indices have shown significant gains following positive economic indicators.',
      url: 'https://example.com/stock-market',
      imageUrl: getUniqueFallbackImage('business'),
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: 'Financial Times',
      category: 'business',
      isBookmarked: false
    },
    {
      id: 'fallback-4',
      title: 'Olympic Games Set to Begin Next Month',
      description: 'Athletes from around the world are preparing for the upcoming Olympic Games.',
      url: 'https://example.com/olympics',
      imageUrl: getUniqueFallbackImage('sports'),
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: 'Sports Daily',
      category: 'sports',
      isBookmarked: false
    },
    {
      id: 'fallback-5',
      title: 'New Medical Research Shows Promising Results',
      description: 'Researchers have published findings that could lead to new treatments for chronic diseases.',
      url: 'https://example.com/medical-research',
      imageUrl: getUniqueFallbackImage('health'),
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'Medical Journal',
      category: 'health',
      isBookmarked: false
    }
  ];

  // Filter by category if not 'all'
  if (category !== 'all') {
    return fallbackArticles.filter(article => article.category === category);
  }

  return fallbackArticles;
};

export const fetchNews = async (
  category: NewsCategory = 'all',
  query?: string
): Promise<NewsArticle[]> => {
  return enhancedFetchNews(category, query);
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  return enhancedSearchNews(query);
};

// Local caching for news articles
interface CachedNews {
  articles: NewsArticle[];
  timestamp: number;
  category: NewsCategory;
  query?: string;
}

const NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const newsCache = new Map<string, CachedNews>();

// Generate cache key
const getCacheKey = (category: NewsCategory, query?: string): string => {
  return `${category}-${query || 'no-query'}`;
};

// Get cached news if available and not expired
const getCachedNews = (category: NewsCategory, query?: string): NewsArticle[] | null => {
  const cacheKey = getCacheKey(category, query);
  const cached = newsCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < NEWS_CACHE_DURATION) {
    console.log('Using cached news data');
    return cached.articles;
  }
  
  return null;
};

// Cache news articles
const setCachedNews = (category: NewsCategory, articles: NewsArticle[], query?: string): void => {
  const cacheKey = getCacheKey(category, query);
  newsCache.set(cacheKey, {
    articles,
    timestamp: Date.now(),
    category,
    query
  });
};

// Function to clear image cache (useful for refreshing)
export const clearImageCache = (): void => {
  enhancedClearImageCache();
};

// Function to clear news cache
export const clearNewsCache = (): void => {
  enhancedClearNewsCache();
};

// Export API status function
export { getAPIStatus };

// Function to get better fallback images with more variety
const getBetterFallbackImages = (): Record<string, string[]> => {
  return {
    'world': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'business': [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'technology': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'sports': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'entertainment': [
      'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1489599808885-4b5b3b3b3b3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'health': [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    'science': [
      'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1532094349884-543bc88bdb34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ]
  };
};