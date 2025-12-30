import { useState, useEffect } from 'react';

const BOOKMARKS_STORAGE_KEY = 'news_app_bookmarks';

export const useBookmarkedArticles = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return storedBookmarks ? new Set(JSON.parse(storedBookmarks)) : new Set();
    } catch (error) {
      console.error('Error reading bookmarks from localStorage:', error);
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarkedArticles)));
    } catch (error) {
      console.error('Error saving bookmarks to localStorage:', error);
    }
  }, [bookmarkedArticles]);

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newBookmarked = new Set(prev);
      if (newBookmarked.has(articleId)) {
        newBookmarked.delete(articleId);
      } else {
        newBookmarked.add(articleId);
      }
      return newBookmarked;
    });
  };

  return { bookmarkedArticles, handleBookmark };
};