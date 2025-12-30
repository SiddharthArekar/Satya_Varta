import { NewsArticle } from '@/components/NewsCard';
import { UserPreferences, UserInterest } from './userInterestsService';
import { fetchNews } from './newsService';

export interface RecommendationScore {
  article: NewsArticle;
  score: number;
  reasons: string[];
}

export const calculateRecommendationScore = (
  article: NewsArticle,
  preferences: UserPreferences
): RecommendationScore => {
  let score = 0;
  const reasons: string[] = [];

  // Category interest scoring
  const categoryInterest = preferences.interests.find(
    interest => interest.category === article.category
  );
  
  if (categoryInterest) {
    score += categoryInterest.weight * 0.4; // 40% weight for category preference
    reasons.push(`Matches your interest in ${article.category} news`);
  } else {
    score += 0.2; // Default score for unknown categories
  }

  // Source preference scoring
  if (preferences.preferredSources.includes(article.source)) {
    score += 0.3; // 30% weight for preferred sources
    reasons.push(`From your preferred source: ${article.source}`);
  }

  // Recency scoring (newer articles get higher scores)
  const articleAge = Date.now() - new Date(article.publishedAt).getTime();
  const hoursOld = articleAge / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 1 - (hoursOld / 24)); // Decay over 24 hours
  score += recencyScore * 0.2; // 20% weight for recency
  reasons.push(`Published ${Math.round(hoursOld)} hours ago`);

  // Reading history bonus (avoid articles already read)
  if (preferences.readingHistory.includes(article.id)) {
    score *= 0.1; // Heavily penalize already read articles
    reasons.push('Already read');
  }

  // Bookmarked category bonus
  if (preferences.bookmarkedCategories.includes(article.category)) {
    score += 0.1; // 10% bonus for bookmarked categories
    reasons.push(`You've bookmarked ${article.category} articles`);
  }

  // Title/description keyword matching (simple implementation)
  const keywords = extractKeywords(article.title + ' ' + article.description);
  const userKeywords = extractUserKeywords(preferences);
  const keywordMatch = calculateKeywordMatch(keywords, userKeywords);
  score += keywordMatch * 0.1; // 10% weight for keyword matching

  return {
    article,
    score: Math.max(0, Math.min(1, score)),
    reasons: reasons.filter(reason => reason !== 'Already read' || score > 0.1)
  };
};

export const getRecommendedNews = async (
  preferences: UserPreferences,
  limit: number = 20
): Promise<NewsArticle[]> => {
  try {
    // Get news from all categories the user is interested in
    const interestedCategories = preferences.interests
      .filter(interest => interest.weight > 0.3)
      .map(interest => interest.category);

    if (interestedCategories.length === 0) {
      // Fallback to general news if no specific interests
      return await fetchNews('all');
    }

    // Fetch news from multiple categories
    const newsPromises = interestedCategories.map(category => fetchNews(category));
    const newsResults = await Promise.all(newsPromises);
    
    // Flatten and deduplicate
    const allArticles = newsResults.flat();
    const uniqueArticles = allArticles.reduce((acc: NewsArticle[], current) => {
      if (!acc.some(a => a.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Calculate recommendation scores
    const scoredArticles = uniqueArticles.map(article => 
      calculateRecommendationScore(article, preferences)
    );

    // Sort by score and return top articles
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);

  } catch (error) {
    console.error('Error getting recommended news:', error);
    // Fallback to general news
    return await fetchNews('all');
  }
};

// Helper functions
const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !STOP_WORDS.has(word));
};

const extractUserKeywords = (preferences: UserPreferences): string[] => {
  // Extract keywords from reading history and interests
  const keywords: string[] = [];
  
  // Add category names as keywords
  preferences.interests.forEach(interest => {
    if (interest.weight > 0.5) {
      keywords.push(interest.category);
    }
  });

  return keywords;
};

const calculateKeywordMatch = (articleKeywords: string[], userKeywords: string[]): number => {
  if (userKeywords.length === 0) return 0;
  
  const matches = articleKeywords.filter(keyword => 
    userKeywords.some(userKeyword => 
      keyword.includes(userKeyword) || userKeyword.includes(keyword)
    )
  ).length;
  
  return matches / userKeywords.length;
};

const STOP_WORDS = new Set([
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'can', 'must', 'shall', 'a', 'an', 'as', 'if', 'then', 'else', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'now'
]);
