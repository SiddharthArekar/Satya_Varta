import React, { memo, useMemo, useCallback } from 'react';
import { Calendar, ExternalLink, Bookmark, BookmarkCheck, Clock, Zap, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "./spotlight-card";
import { NewsCategory } from "../CategoryTabs";
import { useTranslation } from "@/hooks/useTranslation";
import { TrustMeter } from "../TrustMeter";
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

interface SpotlightNewsCardProps {
  article: NewsArticle;
  onBookmark?: (id: string) => void;
  onRead?: (article: NewsArticle) => void;
  onSummary?: (article: NewsArticle) => void;
  onFactCheck?: (article: NewsArticle) => void;
  credibilityScore?: CredibilityScore | null;
  showTrustMeter?: boolean;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

const getCategoryStyle = (category: NewsCategory) => {
  const styles = {
    all: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    'for-you': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
    bookmarks: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200',
    world: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    business: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
    entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200',
    health: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200',
    science: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200',
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
  const publishedDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return publishedDate.toLocaleDateString('en-US', options);
};

const getGlowColorForCategory = (category: NewsCategory): 'blue' | 'purple' | 'green' | 'red' | 'orange' => {
  const colorMap = {
    all: 'blue' as const,
    'for-you': 'purple' as const,
    bookmarks: 'red' as const,
    world: 'blue' as const,
    business: 'green' as const,
    technology: 'purple' as const,
    sports: 'orange' as const,
    entertainment: 'red' as const,
    health: 'green' as const,
    science: 'blue' as const,
  };
  return colorMap[category] || 'blue';
};

const SpotlightNewsCardComponent = ({ 
  article, 
  onBookmark, 
  onRead, 
  onSummary,
  onFactCheck, 
  credibilityScore, 
  showTrustMeter = false,
  glowColor
}: SpotlightNewsCardProps) => {
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

  // Memoize computed values
  const categoryStyle = useMemo(() => getCategoryStyle(article.category), [article.category]);
  const formattedTime = useMemo(() => formatTimeAgo(article.publishedAt), [article.publishedAt]);
  const glowColorValue = useMemo(() => glowColor || getGlowColorForCategory(article.category), [glowColor, article.category]);
  
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
    <GlowCard 
      glowColor={glowColorValue}
      customSize={true}
      enableGlow={true} // Keep glow enabled for spotlight cards
      className="w-full h-full cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="p-6 h-full flex flex-col">
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
        <div className="space-y-3 flex-1">
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
        <div className="flex items-center justify-between pt-4 border-t border-card-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium">{article.source}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className="h-8 w-8 p-0 hover-float"
            >
              {article.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSummaryClick}
              className="h-8 w-8 p-0 hover-float"
            >
              <Zap className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFactCheckClick}
              className="h-8 w-8 p-0 hover-float"
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </GlowCard>
  );
};

// Export memoized component for performance optimization
export const SpotlightNewsCard = memo(SpotlightNewsCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.isBookmarked === nextProps.article.isBookmarked &&
    prevProps.showTrustMeter === nextProps.showTrustMeter &&
    prevProps.credibilityScore === nextProps.credibilityScore &&
    prevProps.glowColor === nextProps.glowColor
  );
});
