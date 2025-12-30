// Search Suggestions Service
// Provides trending topics and search suggestions based on current events

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'trending' | 'category' | 'recent' | 'popular';
  category?: string;
  count?: number;
}

// Trending topics based on current events and popular searches
const TRENDING_TOPICS: SearchSuggestion[] = [
  // Indian-specific trending topics
  { id: 'trending-1', text: 'India News', type: 'trending', category: 'world' },
  { id: 'trending-2', text: 'Indian Economy', type: 'trending', category: 'business' },
  { id: 'trending-3', text: 'Indian Technology', type: 'trending', category: 'technology' },
  { id: 'trending-4', text: 'Bollywood News', type: 'trending', category: 'entertainment' },
  { id: 'trending-5', text: 'Cricket News', type: 'trending', category: 'sports' },
  { id: 'trending-6', text: 'Indian Politics', type: 'trending', category: 'world' },
  { id: 'trending-7', text: 'Indian Stock Market', type: 'trending', category: 'business' },
  { id: 'trending-8', text: 'Indian Startups', type: 'trending', category: 'business' },
  { id: 'trending-9', text: 'Indian Sports', type: 'trending', category: 'sports' },
  { id: 'trending-10', text: 'Indian Health', type: 'trending', category: 'health' },
  { id: 'trending-11', text: 'Indian Science', type: 'trending', category: 'science' },
  { id: 'trending-12', text: 'Indian Education', type: 'trending', category: 'world' },
  
  // Global trending topics
  { id: 'trending-13', text: 'AI Technology', type: 'trending', category: 'technology' },
  { id: 'trending-14', text: 'Climate Change', type: 'trending', category: 'world' },
  { id: 'trending-15', text: 'Stock Market', type: 'trending', category: 'business' },
  { id: 'trending-16', text: 'Space Exploration', type: 'trending', category: 'science' },
  { id: 'trending-17', text: 'Olympics 2024', type: 'trending', category: 'sports' },
  { id: 'trending-18', text: 'Movie Releases', type: 'trending', category: 'entertainment' },
  { id: 'trending-19', text: 'Health Research', type: 'trending', category: 'health' },
  { id: 'trending-20', text: 'Cryptocurrency', type: 'trending', category: 'business' },
  { id: 'trending-21', text: 'Electric Vehicles', type: 'trending', category: 'technology' },
  { id: 'trending-22', text: 'Climate Summit', type: 'trending', category: 'world' },
  { id: 'trending-23', text: 'Tech Startups', type: 'trending', category: 'business' },
  { id: 'trending-24', text: 'Mental Health', type: 'trending', category: 'health' },
  { id: 'trending-25', text: 'Renewable Energy', type: 'trending', category: 'science' },
  { id: 'trending-26', text: 'World Cup', type: 'trending', category: 'sports' },
  { id: 'trending-27', text: 'Streaming Shows', type: 'trending', category: 'entertainment' },
  { id: 'trending-28', text: 'Global Politics', type: 'trending', category: 'world' },
  { id: 'trending-29', text: 'Quantum Computing', type: 'trending', category: 'technology' },
  { id: 'trending-30', text: 'Medical Breakthroughs', type: 'trending', category: 'health' }
];

// Popular search categories
const CATEGORY_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'cat-1', text: 'Technology News', type: 'category', category: 'technology' },
  { id: 'cat-2', text: 'World News', type: 'category', category: 'world' },
  { id: 'cat-3', text: 'Business Updates', type: 'category', category: 'business' },
  { id: 'cat-4', text: 'Sports Highlights', type: 'category', category: 'sports' },
  { id: 'cat-5', text: 'Entertainment News', type: 'category', category: 'entertainment' },
  { id: 'cat-6', text: 'Health & Wellness', type: 'category', category: 'health' },
  { id: 'cat-7', text: 'Science Discoveries', type: 'category', category: 'science' }
];

// Local storage key for recent searches
const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 10;

class SearchSuggestionsService {
  private recentSearches: string[] = [];

  constructor() {
    this.loadRecentSearches();
  }

  // Load recent searches from localStorage
  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      this.recentSearches = [];
    }
  }

  // Save recent searches to localStorage
  private saveRecentSearches(): void {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }

  // Add a search to recent searches
  public addRecentSearch(query: string): void {
    if (!query || query.trim() === '') return;

    const trimmedQuery = query.trim();
    
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(search => search.toLowerCase() !== trimmedQuery.toLowerCase());
    
    // Add to beginning
    this.recentSearches.unshift(trimmedQuery);
    
    // Limit to max recent searches
    this.recentSearches = this.recentSearches.slice(0, MAX_RECENT_SEARCHES);
    
    this.saveRecentSearches();
  }

  // Get recent searches as suggestions
  public getRecentSearches(): SearchSuggestion[] {
    return this.recentSearches.map((search, index) => ({
      id: `recent-${index}`,
      text: search,
      type: 'recent' as const
    }));
  }

  // Clear recent searches
  public clearRecentSearches(): void {
    this.recentSearches = [];
    this.saveRecentSearches();
  }

  // Get trending topics
  public getTrendingTopics(): SearchSuggestion[] {
    return TRENDING_TOPICS;
  }

  // Get category suggestions
  public getCategorySuggestions(): SearchSuggestion[] {
    return CATEGORY_SUGGESTIONS;
  }

  // Get all suggestions based on query
  public getSuggestions(query: string = '', limit: number = 8): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    if (!query || query.trim() === '') {
      // Show trending topics and recent searches when no query
      suggestions.push(...this.getTrendingTopics().slice(0, 6));
      suggestions.push(...this.getRecentSearches().slice(0, 4));
    } else {
      const lowerQuery = query.toLowerCase().trim();
      
      // Smart search logic with multiple matching strategies
      const allSuggestions = [
        ...TRENDING_TOPICS,
        ...CATEGORY_SUGGESTIONS,
        ...this.getRecentSearches()
      ];
      
      // Multiple matching strategies for better suggestions
      const exactMatches = allSuggestions.filter(s => 
        s.text.toLowerCase() === lowerQuery
      );
      
      const startsWithMatches = allSuggestions.filter(s => 
        s.text.toLowerCase().startsWith(lowerQuery)
      );
      
      const containsMatches = allSuggestions.filter(s => 
        s.text.toLowerCase().includes(lowerQuery)
      );
      
      const wordMatches = allSuggestions.filter(s => 
        s.text.toLowerCase().split(' ').some(word => 
          word.startsWith(lowerQuery) || lowerQuery.split(' ').some(qWord => 
            word.includes(qWord)
          )
        )
      );
      
      // Combine matches with priority (exact > startsWith > contains > word)
      suggestions.push(...exactMatches);
      suggestions.push(...startsWithMatches);
      suggestions.push(...containsMatches);
      suggestions.push(...wordMatches);
      
      // Add smart suggestions based on query patterns
      if (lowerQuery.includes('india') || lowerQuery.includes('indian')) {
        suggestions.push(
          { id: 'smart-1', text: 'India News', type: 'trending', category: 'world' },
          { id: 'smart-2', text: 'Indian Politics', type: 'trending', category: 'world' },
          { id: 'smart-3', text: 'Indian Economy', type: 'trending', category: 'business' }
        );
      }
      
      if (lowerQuery.includes('tech') || lowerQuery.includes('technology')) {
        suggestions.push(
          { id: 'smart-4', text: 'Indian Technology', type: 'trending', category: 'technology' },
          { id: 'smart-5', text: 'Tech Startups', type: 'trending', category: 'business' }
        );
      }
      
      if (lowerQuery.includes('cricket') || lowerQuery.includes('sports')) {
        suggestions.push(
          { id: 'smart-6', text: 'Cricket News', type: 'trending', category: 'sports' },
          { id: 'smart-7', text: 'Indian Sports', type: 'trending', category: 'sports' }
        );
      }
      
      if (lowerQuery.includes('bollywood') || lowerQuery.includes('movie')) {
        suggestions.push(
          { id: 'smart-8', text: 'Bollywood News', type: 'trending', category: 'entertainment' },
          { id: 'smart-9', text: 'Movie Releases', type: 'trending', category: 'entertainment' }
        );
      }
    }
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
    );
    
    return uniqueSuggestions.slice(0, limit);
  }

  // Get popular searches (simulated based on trending topics)
  public getPopularSearches(): SearchSuggestion[] {
    return TRENDING_TOPICS.slice(0, 5).map(topic => ({
      ...topic,
      type: 'popular' as const
    }));
  }

  // Generate dynamic suggestions based on current time and trends
  public getDynamicSuggestions(): SearchSuggestion[] {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    const suggestions: SearchSuggestion[] = [];
    
    // Morning suggestions (6-12)
    if (hour >= 6 && hour < 12) {
      suggestions.push(
        { id: 'morning-1', text: 'Morning Markets', type: 'trending', category: 'business' },
        { id: 'morning-2', text: 'Tech News Today', type: 'trending', category: 'technology' }
      );
    }
    
    // Afternoon suggestions (12-18)
    if (hour >= 12 && hour < 18) {
      suggestions.push(
        { id: 'afternoon-1', text: 'Stock Updates', type: 'trending', category: 'business' },
        { id: 'afternoon-2', text: 'Global News', type: 'trending', category: 'world' }
      );
    }
    
    // Evening suggestions (18-24)
    if (hour >= 18) {
      suggestions.push(
        { id: 'evening-1', text: 'Entertainment News', type: 'trending', category: 'entertainment' },
        { id: 'evening-2', text: 'Sports Highlights', type: 'trending', category: 'sports' }
      );
    }
    
    // Weekend suggestions
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      suggestions.push(
        { id: 'weekend-1', text: 'Weekend Sports', type: 'trending', category: 'sports' },
        { id: 'weekend-2', text: 'Entertainment Updates', type: 'trending', category: 'entertainment' }
      );
    }
    
    return suggestions;
  }
}

// Create singleton instance
export const searchSuggestionsService = new SearchSuggestionsService();

// Export the class for testing
export { SearchSuggestionsService };
