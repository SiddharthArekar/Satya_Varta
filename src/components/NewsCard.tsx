import React, { memo, useMemo, useCallback } from "react";
import { Calendar, ExternalLink, Bookmark, BookmarkCheck, Clock, Zap, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsCategory } from "./CategoryTabs";
import { useTranslation } from "@/hooks/useTranslation";
import { TrustMeter } from "./TrustMeter";
import { CredibilityScore } from "@/services/factCheckService";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: NewsCategory;
  isBookmarked?: boolean;
}

interface NewsCardProps {
  article: NewsArticle;
  onBookmark?: (id: string) => void;
  onRead?: (article: NewsArticle) => void;
  onSummary?: (article: NewsArticle) => void;
  onFactCheck?: (article: NewsArticle) => void;
  credibilityScore?: CredibilityScore | null;
  showTrustMeter?: boolean;
}

const getCategoryStyle = (category: NewsCategory) => {
  const styles = {
    world: 'category-world',
    business: 'category-business', 
    technology: 'category-technology',
    sports: 'category-sports',
    entertainment: 'category-entertainment',
    health: 'category-health',
    science: 'category-science',
    all: 'text-primary bg-primary/10'
  };
  return styles[category] || styles.all;
};

// Fallback image generator
const getFallbackImage = (category: NewsCategory): string => {
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
    ],
    'for-you': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60'
    ],
    bookmarks: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60'
    ]
  };

  const images = fallbackImages[category] || fallbackImages.all;
  return images[Math.floor(Math.random() * images.length)];
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  // For older articles, show full date with time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return publishedDate.toLocaleDateString('en-US', options);
};

const NewsCardComponent = ({ 
  article, 
  onBookmark, 
  onRead, 
  onSummary, 
  onFactCheck, 
  credibilityScore, 
  showTrustMeter = false 
}: NewsCardProps) => {
  const { translatedText: translatedTitle } = useTranslation(article.title);
  const { translatedText: translatedDescription } = useTranslation(article.description || '');
  const { translatedText: readIn30Seconds } = useTranslation("Read in 30 seconds");
  
  // Memoize fallback image to prevent recalculation
  const fallbackImage = useMemo(() => getFallbackImage(article.category), [article.category]);
  
  // Use image fallback hook for better image handling
  const { imageSrc, isLoading: imageLoading, hasError: imageError, retry } = useImageWithFallback({
    src: article.imageUrl || '',
    fallbackSrc: fallbackImage,
    category: article.category
  });

  // Memoize category style
  const categoryStyle = useMemo(() => getCategoryStyle(article.category), [article.category]);
  
  // Memoize formatted time
  const formattedTime = useMemo(() => formatTimeAgo(article.publishedAt), [article.publishedAt]);
  
  const handleCardClick = useCallback(() => {
    if (onRead) {
      onRead(article);
    } else {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  }, [onRead, article]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(article.id);
  }, [onBookmark, article.id]);

  const handleSummaryClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSummary?.(article);
  }, [onSummary, article]);

  const handleFactCheckClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFactCheck?.(article);
  }, [onFactCheck, article]);

  return (
    <article className="glass-card hover-float group cursor-pointer" onClick={handleCardClick}>
      <div className="p-6">
        {/* Header with Category & Time */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className={`${categoryStyle} border-0 font-medium`}>
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Badge>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="h-3 w-3" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Trust Meter */}
        {showTrustMeter && credibilityScore && (
          <div className="mb-4">
            <TrustMeter 
              score={credibilityScore} 
              onViewDetails={() => onFactCheck?.(article)}
              compact={true}
            />
          </div>
        )}

        {/* Image */}
        <div className="mb-4 overflow-hidden rounded-xl relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Loading image...</span>
              </div>
            </div>
          )}
          <img
            src={imageSrc}
            alt={article.title}
            className={`w-full h-48 object-cover smooth-transition group-hover:scale-105 ${
              imageLoading ? 'opacity-30' : 'opacity-100'
            }`}
            loading="lazy"
            onError={() => {
              if (!imageError) {
                retry();
              }
            }}
          />
          {imageError && imageSrc === fallbackImage && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  retry();
                }}
                className="h-8 w-8 p-0 bg-background/90 hover:bg-background border border-border/50"
                title="Retry loading original image"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
          {imageError && imageSrc !== fallbackImage && (
            <div className="absolute top-2 right-2">
              <div className="h-8 w-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                <span className="text-xs text-orange-600 dark:text-orange-400">!</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg leading-tight text-card-foreground group-hover:text-primary smooth-transition line-clamp-2">
            {translatedTitle}
          </h2>
          
          {translatedDescription && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {translatedDescription}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-card-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium">{article.source}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className="hover-float"
            >
              {article.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm" className="hover-float">
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            {onFactCheck && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFactCheckClick}
                className="hover-float"
                title="Check credibility"
              >
                <Shield className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Summary Button */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSummaryClick}
            className="w-full flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40"
          >
            <Zap className="h-4 w-4" />
            {readIn30Seconds}
          </Button>
        </div>
      </div>
    </article>
  );
};

// Export memoized component for performance optimization
export const NewsCard = memo(NewsCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.isBookmarked === nextProps.article.isBookmarked &&
    prevProps.showTrustMeter === nextProps.showTrustMeter &&
    prevProps.credibilityScore === nextProps.credibilityScore
  );
});