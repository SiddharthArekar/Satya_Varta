import { useState, useEffect } from 'react';
import { NewsArticle } from '@/components/NewsCard';
import { CredibilityScore, calculateCredibilityScore, getCachedCredibilityScore, setCachedCredibilityScore } from '@/services/factCheckService';
import { useToast } from './use-toast';

export const useFactCheck = () => {
  const [credibilityScores, setCredibilityScores] = useState<Map<string, CredibilityScore>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getCredibilityScore = async (article: NewsArticle): Promise<CredibilityScore> => {
    // Check cache first
    const cached = getCachedCredibilityScore(article.id);
    if (cached) {
      setCredibilityScores(prev => new Map(prev.set(article.id, cached)));
      return cached;
    }

    try {
      setIsLoading(true);
      const score = await calculateCredibilityScore(article);
      
      // Cache the result
      setCachedCredibilityScore(article.id, score);
      setCredibilityScores(prev => new Map(prev.set(article.id, score)));
      
      return score;
    } catch (error) {
      console.error('Error calculating credibility score:', error);
      toast({
        title: "Fact check failed",
        description: "Could not verify article credibility. Please try again.",
        variant: "destructive",
      });
      
      // Return default score on error
      const defaultScore: CredibilityScore = {
        overall: 50,
        sourceReliability: 50,
        factCheckStatus: 50,
        recency: 50,
        details: {
          hasFactCheck: false,
          factCheckResults: [],
          sourceTrustLevel: 'UNKNOWN',
          lastVerified: null
        }
      };
      
      setCredibilityScores(prev => new Map(prev.set(article.id, defaultScore)));
      return defaultScore;
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreForArticle = (articleId: string): CredibilityScore | null => {
    return credibilityScores.get(articleId) || null;
  };

  const refreshScore = async (article: NewsArticle): Promise<CredibilityScore> => {
    // Remove from cache to force refresh
    setCredibilityScores(prev => {
      const newMap = new Map(prev);
      newMap.delete(article.id);
      return newMap;
    });
    
    return getCredibilityScore(article);
  };

  const batchCheckArticles = async (articles: NewsArticle[]): Promise<void> => {
    try {
      setIsLoading(true);
      
      const promises = articles.map(async (article) => {
        const cached = getCachedCredibilityScore(article.id);
        if (cached) {
          return { articleId: article.id, score: cached };
        }
        
        try {
          const score = await calculateCredibilityScore(article);
          setCachedCredibilityScore(article.id, score);
          return { articleId: article.id, score };
        } catch (error) {
          console.error(`Error checking article ${article.id}:`, error);
          return { articleId: article.id, score: null };
        }
      });
      
      const results = await Promise.all(promises);
      
      setCredibilityScores(prev => {
        const newMap = new Map(prev);
        results.forEach(({ articleId, score }) => {
          if (score) {
            newMap.set(articleId, score);
          }
        });
        return newMap;
      });
      
    } catch (error) {
      console.error('Error batch checking articles:', error);
      toast({
        title: "Batch fact check failed",
        description: "Could not verify multiple articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    setCredibilityScores(new Map());
  };

  return {
    getCredibilityScore,
    getScoreForArticle,
    refreshScore,
    batchCheckArticles,
    clearCache,
    isLoading
  };
};
