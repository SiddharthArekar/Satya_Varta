import { useState, useEffect } from 'react';
import type { NewsArticle } from '@/components/NewsCard';

const BOOKMARKS_STORAGE_KEY = 'news_app_bookmarked_articles';

// Fallback image generator for bookmarked articles
const getFallbackImage = (category: string): string => {
  const fallbackImages: Record<string, string[]> = {
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
};

// Function to ensure article has a valid image URL
const ensureValidImageUrl = (article: NewsArticle): NewsArticle => {
  // If no image URL or it's empty, use fallback
  if (!article.imageUrl || article.imageUrl.trim() === '') {
    return {
      ...article,
      imageUrl: getFallbackImage(article.category)
    };
  }

  // Check if the URL is valid
  try {
    const url = new URL(article.imageUrl);
    // If it's a valid URL, return as is
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return article;
    }
  } catch {
    // Invalid URL, use fallback
  }

  // Use fallback image
  return {
    ...article,
    imageUrl: getFallbackImage(article.category)
  };
};

// Function to validate and fix bookmarked articles
const validateBookmarkedArticles = (articles: NewsArticle[]): NewsArticle[] => {
  return articles.map(article => {
    // Ensure the article has all required fields
    const validatedArticle: NewsArticle = {
      id: article.id || `bookmark-${Date.now()}-${Math.random()}`,
      title: article.title || 'Untitled Article',
      description: article.description || 'No description available',
      url: article.url || '#',
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: article.source || 'Unknown Source',
      category: article.category || 'all',
      isBookmarked: true
    };

    return ensureValidImageUrl(validatedArticle);
  });
};

export const useBookmarks = () => {
    const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsArticle[]>(() => {
        try {
            const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
            if (storedBookmarks) {
                const parsed = JSON.parse(storedBookmarks);
                // Validate and fix any issues with stored bookmarks
                return validateBookmarkedArticles(parsed);
            }
            return [];
        } catch (error) {
            console.error('Error reading bookmarks from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedArticles));
        } catch (error) {
            console.error('Error saving bookmarks to localStorage:', error);
        }
    }, [bookmarkedArticles]);

    const toggleBookmark = (article: NewsArticle) => {
        setBookmarkedArticles(prev => {
            const isBookmarked = prev.some(a => a.id === article.id);
            if (isBookmarked) {
                return prev.filter(a => a.id !== article.id);
            } else {
                // Ensure the article has a valid image before bookmarking
                const validatedArticle = ensureValidImageUrl({
                    ...article,
                    isBookmarked: true
                });
                return [validatedArticle, ...prev];
            }
        });
    };

    // Function to refresh images for all bookmarked articles
    const refreshBookmarkImages = () => {
        setBookmarkedArticles(prev => 
            prev.map(article => ensureValidImageUrl(article))
        );
    };

    // Function to clean up invalid bookmarks
    const cleanupBookmarks = () => {
        setBookmarkedArticles(prev => 
            prev.filter(article => {
                // Keep articles that have valid IDs and titles
                return article.id && article.title && article.title.trim() !== '';
            })
        );
    };
    
    const bookmarkedIds = new Set(bookmarkedArticles.map(a => a.id));

    return { 
        bookmarkedArticles, 
        toggleBookmark, 
        bookmarkedIds,
        refreshBookmarkImages,
        cleanupBookmarks
    };
};