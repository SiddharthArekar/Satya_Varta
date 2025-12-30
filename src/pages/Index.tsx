import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { TrendingNewsSlider } from "@/components/TrendingNewsSlider";
import { CategoryTabs, NewsCategory } from "@/components/CategoryTabs";
import { NewsCategoryNavBar } from "@/components/ui/tubelight-navbar-demo";
import { NewsCard, NewsArticle } from "@/components/NewsCard";
import { SpotlightNewsCard } from "@/components/ui/spotlight-news-card";
import { ArticleModal } from "@/components/ArticleModal";
import { SummaryModal } from "@/components/SummaryModal";
import { AISummaryModal } from "@/components/AISummaryModal";
import { LocationToggle } from "@/components/LocationToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, Globe, AlertTriangle, Bookmark, User, Sparkles, Grid3X3 } from "lucide-react";
import { fetchNews, searchNews, clearImageCache, clearNewsCache } from "@/services/newsService";
import { newsServiceManager } from "@/services/enhancedNewsService";
import { NewsSearchOptions } from "@/services/enhancedNewsService";
import { summarizeArticle, getCachedSummary, setCachedSummary, NewsSummary } from "@/services/summaryService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useBreakingNews } from "@/hooks/useBreakingNews";
import { breakingNewsService } from "@/services/breakingNewsService";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUserInterests } from "@/hooks/useUserInterests";
import { getRecommendedNews } from "@/services/recommendationService";
import { useFactCheck } from "@/hooks/useFactCheck";
import { FactCheckModal } from "@/components/FactCheckModal";
import { CredibilityScore } from "@/services/factCheckService";
import { useDebounce } from "@/hooks/useDebounce";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const { translatedText: latestNewsText } = useTranslation('Latest News');
  const { translatedText: articlesFoundText } = useTranslation('articles found');
  const { translatedText: refreshText } = useTranslation('Refresh');
  const { translatedText: noArticlesText } = useTranslation('No articles found');
  const { translatedText: viewAllNewsText } = useTranslation('View All News');
  const { translatedText: breakingNewsText } = useTranslation('Breaking News');
  const { translatedText: bookmarksText } = useTranslation('Bookmarks');
  const { translatedText: noBookmarksText } = useTranslation('No bookmarked articles');
  const { translatedText: browseNewsText } = useTranslation('Browse News');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentSearchOptions, setCurrentSearchOptions] = useState<NewsSearchOptions>({});
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  
  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const { bookmarkedArticles, toggleBookmark, bookmarkedIds, refreshBookmarkImages, cleanupBookmarks } = useBookmarks();
  const { preferences, trackRead, trackBookmarkCategory } = useUserInterests();
  const { getCredibilityScore, getScoreForArticle, isLoading: isFactChecking } = useFactCheck();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<NewsSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isFactCheckModalOpen, setIsFactCheckModalOpen] = useState(false);
  const [currentFactCheckScore, setCurrentFactCheckScore] = useState<CredibilityScore | null>(null);
  const [isAISummaryModalOpen, setIsAISummaryModalOpen] = useState(false);
  const [selectedArticleForAISummary, setSelectedArticleForAISummary] = useState<NewsArticle | null>(null);
  const [useSpotlightCards, setUseSpotlightCards] = useState(true);
  const { toast } = useToast();
  const { breakingNews, refreshBreakingNews } = useBreakingNews();
  const newsSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to news section with smooth animation
  const scrollToNewsSection = () => {
    if (newsSectionRef.current) {
      const headerHeight = 100; // Approximate header height
      const elementPosition = newsSectionRef.current.offsetTop;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Optimized deduplication function
  const deduplicateArticles = useCallback((articles: NewsArticle[]): NewsArticle[] => {
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
  }, []);

  // Load news articles with enhanced options
  const loadNews = useCallback(async (category: NewsCategory = 'all', query?: string, options?: NewsSearchOptions) => {
    if (category === 'bookmarks') return;
    try {
      setIsLoading(true);
      let newArticles: NewsArticle[];
      
      // Prepare search options with location data
      const searchOptions: NewsSearchOptions = {
        ...options,
        category: options?.category || category,
        query: options?.query || query,
        useLocation: useLocation,
        locationData: userLocation
      };
      
      if (options) {
        // Use advanced search options
        newArticles = await newsServiceManager.fetchNews(searchOptions);
        setCurrentSearchOptions(searchOptions);
      } else if (query) {
        newArticles = await searchNews(query);
        setCurrentSearchOptions({ query, useLocation, locationData: userLocation });
      } else if (category === 'for-you') {
        if (preferences) {
          newArticles = await getRecommendedNews(preferences, 50);
        } else {
          // Fallback to latest news if no preferences
          newArticles = await fetchNews('all', undefined, useLocation);
          // Show a toast to guide users to set preferences (after a slight delay)
          setTimeout(() => {
            toast({
              title: "💡 Personalize Your Feed",
              description: "Visit your profile to set up interests for better news recommendations.",
              duration: 5000,
            });
          }, 1000);
        }
        setCurrentSearchOptions({ category, useLocation, locationData: userLocation });
      } else {
        newArticles = await fetchNews(category, undefined, useLocation);
        setCurrentSearchOptions({ category, useLocation, locationData: userLocation });
      }
      
      // Use optimized deduplication
      const uniqueArticles = deduplicateArticles(newArticles);
      setArticles(uniqueArticles);
      
      // Show success message if we got articles
      if (uniqueArticles.length > 0) {
        toast({
          title: "News loaded successfully",
          description: `Found ${uniqueArticles.length} articles`,
        });
        
        // Scroll to news section if this was a search or category change
        if (query || category !== 'all') {
          setTimeout(() => {
            scrollToNewsSection();
          }, 100); // Small delay to ensure DOM is updated
        }
      }
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "News service temporarily unavailable",
        description: "Showing sample articles. The service will resume shortly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [deduplicateArticles, preferences, toast, useLocation, userLocation]);

  // Handle location change
  const handleLocationChange = useCallback((location: any, useLocationEnabled: boolean) => {
    setUserLocation(location);
    setUseLocation(useLocationEnabled);
    
    // Reload news with new location settings
    if (activeCategory !== 'bookmarks') {
      loadNews(activeCategory, searchQuery);
    }
  }, [activeCategory, searchQuery, loadNews]);

  // Memoized displayed articles calculation
  const displayedArticles = useMemo(() => {
    const sourceArticles = activeCategory === 'bookmarks' ? bookmarkedArticles : articles;
    
    return sourceArticles
      .map(article => ({
        ...article,
        isBookmarked: bookmarkedIds.has(article.id),
      }));
  }, [activeCategory, bookmarkedArticles, articles, bookmarkedIds]);

  // Limit spotlight cards to improve performance
  const spotlightLimit = 8;
  const shouldUseSpotlight = useSpotlightCards && displayedArticles.length > 0;

  const handleBookmark = useCallback((article: NewsArticle) => {
    toggleBookmark(article);
    
    // Track bookmark for recommendation system
    trackBookmarkCategory(article.category);
    
    // Update selected article if it's currently open
    if (selectedArticle && selectedArticle.id === article.id) {
      setSelectedArticle(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked
      } : null);
    }
  }, [toggleBookmark, trackBookmarkCategory, selectedArticle]);

  const handleArticleRead = useCallback((article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    
    // Track article read for recommendation system
    trackRead(article.id);
  }, [trackRead]);

  const handleArticleSummary = useCallback(async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsSummaryModalOpen(true);
    
    const cachedSummary = getCachedSummary(article.id);
    if (cachedSummary) {
      setCurrentSummary(cachedSummary);
      return;
    }
    
    setIsSummaryLoading(true);
    setCurrentSummary(null);
    
    try {
      const summary = await summarizeArticle(article);
      setCurrentSummary(summary);
      setCachedSummary(article.id, summary);
      toast({
        title: "Summary Ready!",
        description: "AI has generated your 30-second summary.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Failed",
        description: "Could not generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummaryLoading(false);
    }
  }, [toast]);

  const handleFactCheck = useCallback(async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsFactCheckModalOpen(true);
    
    try {
      const score = await getCredibilityScore(article);
      setCurrentFactCheckScore(score);
    } catch (error) {
      console.error('Error getting fact check score:', error);
      toast({
        title: "Fact check failed",
        description: "Could not verify article credibility. Please try again.",
        variant: "destructive",
      });
    }
  }, [getCredibilityScore, toast]);

  const handleReadFullFromSummary = useCallback(() => {
    if (selectedArticle) {
      setIsSummaryModalOpen(false);
      window.open(selectedArticle.url, '_blank', 'noopener,noreferrer');
    }
  }, [selectedArticle]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  }, []);

  const handleFactCheckModalClose = useCallback(() => {
    setIsFactCheckModalOpen(false);
    setSelectedArticle(null);
    setCurrentFactCheckScore(null);
  }, []);

  const handleAISummary = useCallback((article: NewsArticle) => {
    setSelectedArticleForAISummary(article);
    setIsAISummaryModalOpen(true);
  }, []);

  const handleAISummaryModalClose = useCallback(() => {
    setIsAISummaryModalOpen(false);
    setSelectedArticleForAISummary(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    // Clear caches to get fresh data
    clearImageCache();
    clearNewsCache();
    
    // Refresh bookmark images if we're viewing bookmarks
    if (activeCategory === 'bookmarks') {
      refreshBookmarkImages();
    }
    
    await loadNews(activeCategory, searchQuery, currentSearchOptions);
    await refreshBreakingNews();
  }, [activeCategory, searchQuery, currentSearchOptions, loadNews, refreshBreakingNews, refreshBookmarkImages]);

  const handleAdvancedSearch = useCallback(async (options: NewsSearchOptions) => {
    await loadNews(activeCategory, searchQuery, options);
  }, [activeCategory, searchQuery, loadNews]);

  // Clean up bookmarks on component mount
  useEffect(() => {
    cleanupBookmarks();
  }, []);

  // Load initial news
  useEffect(() => {
    loadNews();
  }, []);

  // Handle category changes
  useEffect(() => {
    if (!isInitialLoading) {
      loadNews(activeCategory, searchQuery);
    }
  }, [activeCategory]);

  // Handle search with debounce
  useEffect(() => {
    if (!isInitialLoading && debouncedSearchQuery) {
      loadNews(activeCategory, debouncedSearchQuery);
    } else if (!isInitialLoading && debouncedSearchQuery === '') {
      loadNews(activeCategory);
    }
  }, [debouncedSearchQuery, activeCategory, isInitialLoading, loadNews]);
  
  const currentCategoryName = activeCategory === 'for-you' ? 'For You' : 
    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

  return (
    <div className="min-h-screen bg-background modern-scrollbar">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={(query) => {
          console.log('Search triggered with query:', query);
          loadNews(activeCategory, query);
        }}
        onClearSearch={() => {
          setSearchQuery('');
          setCurrentSearchOptions({});
          loadNews(activeCategory);
        }}
        onAdvancedSearch={handleAdvancedSearch}
      />
      
      <main className="pb-8">
        <TrendingNewsSlider onArticleClick={handleArticleRead} />
        
        <div className="space-y-6" data-news-section ref={newsSectionRef}>
          {/* Tubelight Navigation Bar */}
          <div className="flex justify-center px-4">
            <NewsCategoryNavBar 
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category as NewsCategory)}
            />
          </div>
          
          {/* Location Toggle */}
          <div className="flex justify-center px-4">
            <LocationToggle 
              onLocationChange={handleLocationChange}
              className="mb-4"
            />
          </div>
          
          {/* Original Category Tabs (Hidden) */}
          <div className="hidden">
            <CategoryTabs 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
          
          {breakingNews.length > 0 && activeCategory !== 'bookmarks' && (
            <div className="px-4">
              <div className="glass-card p-6 border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h2 className="font-display font-bold text-lg text-red-700 dark:text-red-300">
                    {breakingNewsText}
                  </h2>
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {breakingNews.length}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {breakingNews.slice(0, 3).map((article) => (
                    <div
                      key={article.id}
                      className="bg-card/50 rounded-lg p-4 border border-red-200/50 dark:border-red-800/50 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleArticleRead(article)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {article.source} • {new Date(article.publishedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-2xl text-foreground">
                  {activeCategory === 'all' ? latestNewsText : 
                   activeCategory === 'bookmarks' ? bookmarksText : 
                   activeCategory === 'for-you' ? (preferences ? 'Recommended for You' : 'Popular News') :
                   `${currentCategoryName} News`
                  }
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {displayedArticles.length} {articlesFoundText}
                  {searchQuery && ` for "${searchQuery}"`}
                  {activeCategory === 'for-you' && !preferences && (
                    <span className="block text-xs mt-1 text-primary">
                      💡 Set up your preferences in Profile for personalized recommendations
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setUseSpotlightCards(!useSpotlightCards)}
                  variant={useSpotlightCards ? "default" : "outline"}
                  size="sm"
                  className="hover-float"
                >
                  {useSpotlightCards ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Spotlight
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </>
                  )}
                </Button>
                
                {activeCategory !== 'bookmarks' && activeCategory !== 'for-you' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="hover-float"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {refreshText}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4">
            {isInitialLoading && activeCategory !== 'bookmarks' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="glass-card overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedArticles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 modern-scrollbar">
                {displayedArticles.map((article) => {
                  const isBreaking = breakingNewsService.isBreakingNews(article.id);
                  return (
                    <div key={article.id} className="relative">
                      {isBreaking && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 z-10 animate-pulse text-xs"
                        >
                          BREAKING
                        </Badge>
                      )}
                      {shouldUseSpotlight && displayedArticles.indexOf(article) < spotlightLimit ? (
                        <SpotlightNewsCard
                          article={article}
                          onBookmark={() => handleBookmark(article)}
                          onRead={handleArticleRead}
                          onSummary={handleAISummary}
                          onFactCheck={handleFactCheck}
                          credibilityScore={getScoreForArticle(article.id)}
                          showTrustMeter={activeCategory === 'for-you'}
                        />
                      ) : (
                        <NewsCard
                          article={article}
                          onBookmark={() => handleBookmark(article)}
                          onRead={handleArticleRead}
                          onSummary={handleAISummary}
                          onFactCheck={handleFactCheck}
                          credibilityScore={getScoreForArticle(article.id)}
                          showTrustMeter={activeCategory === 'for-you'}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="glass-card p-8 max-w-md mx-auto">
                  <div className="text-muted-foreground mb-4">
                    {activeCategory === 'bookmarks' ? (
                      <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    ) : (
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    )}
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {activeCategory === 'bookmarks' ? noBookmarksText : noArticlesText}
                    </h3>
                    <p className="text-sm">
                      {searchQuery 
                        ? `No articles match your search for "${searchQuery}"`
                        : activeCategory === 'bookmarks' 
                        ? 'Your bookmarked articles will appear here.' 
                        : `No articles available in the ${activeCategory} category`
                      }
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}>
                    {activeCategory === 'bookmarks' ? browseNewsText : viewAllNewsText}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <h1>HELLO</h1>
      <h1>HELLO</h1>

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBookmark={() => selectedArticle && handleBookmark(selectedArticle)}
      />

      <SummaryModal
        article={selectedArticle}
        summary={currentSummary}
        isOpen={isSummaryModalOpen}
        isLoading={isSummaryLoading}
        onClose={() => {
          setIsSummaryModalOpen(false);
          setCurrentSummary(null);
        }}
        onReadFull={handleReadFullFromSummary}
      />

      <FactCheckModal
        article={selectedArticle}
        credibilityScore={currentFactCheckScore}
        isOpen={isFactCheckModalOpen}
        onClose={handleFactCheckModalClose}
      />

      <AISummaryModal
        article={selectedArticleForAISummary}
        isOpen={isAISummaryModalOpen}
        onClose={handleAISummaryModalClose}
      />
    </div>
  );
};

export default Index;
