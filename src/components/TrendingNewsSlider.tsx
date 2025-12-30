import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Zap, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewsArticle } from '@/components/NewsCard';
import { fetchNews } from '@/services/newsService';
import { useToast } from '@/hooks/use-toast';

interface TrendingNewsSliderProps {
  onArticleClick?: (article: NewsArticle) => void;
}

export const TrendingNewsSlider: React.FC<TrendingNewsSliderProps> = ({ onArticleClick }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Fetch trending news articles
  const fetchTrendingNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const newsData = await fetchNews('all');
      // Get the most recent and diverse articles for trending
      const trendingArticles = newsData
        .filter((article, index, self) => 
          // Remove duplicates based on title
          index === self.findIndex(a => a.title === article.title)
        )
        .slice(0, 10); // Limit to 10 articles for smooth rotation
      
      setArticles(trendingArticles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching trending news:', error);
      toast({
        title: "Error loading trending news",
        description: "Could not fetch the latest trending stories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying || articles.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, articles.length]);

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Fetch news on component mount
  useEffect(() => {
    fetchTrendingNews();
  }, [fetchTrendingNews]);

  // Manual navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleArticleClick = useCallback((article: NewsArticle) => {
    onArticleClick?.(article);
  }, [onArticleClick]);

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  // Get category color
  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      world: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      business: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
      technology: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      sports: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
      entertainment: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      health: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
      science: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    };
    return colors[category as keyof typeof colors] || colors.world;
  }, []);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden mx-4 mb-8">
        <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-card via-card/90 to-card/70 relative z-10">
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading trending news...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="relative overflow-hidden mx-4 mb-8">
        <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-card via-card/90 to-card/70 relative z-10">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trending news available</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentArticle = articles[currentIndex];

  return (
    <section className="relative overflow-hidden mx-4 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-card via-card/90 to-card/70 relative z-10 modern-scrollbar">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary animate-fade-in">
                <div className="w-8 h-8 luxury-gradient rounded-xl flex items-center justify-center animate-bounce">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-medium text-sm">Trending Now • Live Updates</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight animate-slide-up">
                Breaking
                <span className="news-gradient bg-clip-text text-transparent block animate-gradient">
                  News Stories
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in delay-300">
                Stay ahead with the latest trending stories and breaking news from trusted sources worldwide. 
                Real-time updates delivered to your screen.
              </p>
            </div>

            {/* Live Controls */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:scale-105 transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Play className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">Auto Play</span>
                </button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentIndex + 1} of {articles.length}</span>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex gap-2">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic News Slider */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-luxury)] group">
              {/* News Article Display */}
              <div 
                className="relative w-full h-[400px] transition-all duration-700 ease-in-out"
                style={{
                  backgroundImage: `url(${currentArticle.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Live Indicator */}
                <div className="absolute top-4 left-4 glass-card p-3 rounded-lg border border-card-border/50 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-foreground">LIVE</span>
                  </div>
                </div>

                {/* Breaking News Badge */}
                <div className="absolute top-4 right-4 glass-card p-3 rounded-lg border border-card-border/50 animate-float delay-500">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-medium text-foreground">TRENDING</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="space-y-3">
                    <Badge className={`${getCategoryColor(currentArticle.category)} border`}>
                      {currentArticle.category}
                    </Badge>
                    
                    <h3 className="font-display font-bold text-xl md:text-2xl text-white leading-tight line-clamp-2">
                      {currentArticle.title}
                    </h3>
                    
                    <p className="text-white/80 text-sm line-clamp-2">
                      {currentArticle.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60">
                          {currentArticle.source}
                        </span>
                        <span className="text-xs text-white/60">•</span>
                        <span className="text-xs text-white/60">
                          {formatTimeAgo(currentArticle.publishedAt)}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleArticleClick(currentArticle)}
                        size="sm"
                        className="bg-primary/90 hover:bg-primary text-primary-foreground"
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass-card rounded-lg hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass-card rounded-lg hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>

              {/* 24/7 Coverage Badge */}
              <div className="absolute bottom-4 right-4 glass-card p-4 border border-card-border/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-foreground text-lg animate-counter">24/7</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingNewsSlider;
