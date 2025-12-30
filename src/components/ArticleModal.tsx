import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Bookmark, BookmarkCheck, User, Hash, Eye, Share2 } from "lucide-react";
import { NewsArticle } from "./NewsCard";
import { NewsCategory } from "./CategoryTabs";
import { useTranslation } from "@/hooks/useTranslation";

interface ArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmark?: (id: string) => void;
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

const formatFullDate = (dateString: string) => {
  const publishedDate = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return publishedDate.toLocaleDateString('en-US', options);
};

export const ArticleModal = ({ article, isOpen, onClose, onBookmark }: ArticleModalProps) => {
  const { translatedText: readFullText } = useTranslation("Read Full Article");
  const { translatedText: bookmarkText } = useTranslation("Bookmark");
  const { translatedText: bookmarkedText } = useTranslation("Bookmarked");
  const { translatedText: translatedTitle } = useTranslation(article?.title || "");
  const { translatedText: translatedDescription } = useTranslation(article?.description || "");
  const { translatedText: readingTimeText } = useTranslation("Reading time");
  const { translatedText: wordCountText } = useTranslation("words");
  const { translatedText: publishedText } = useTranslation("Published");
  const { translatedText: sourceText } = useTranslation("Source");
  const { translatedText: categoryText } = useTranslation("Category");
  const { translatedText: shareText } = useTranslation("Share");
  
  if (!article) return null;

  // Calculate reading time and word count
  const wordCount = article.description ? article.description.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

  // Generate article tags based on content and category
  const generateTags = () => {
    const baseTags = [article.category];
    const titleWords = article.title.toLowerCase().split(' ').filter(word => 
      word.length > 4 && !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'will', 'are', 'was', 'news'].includes(word)
    );
    return [...baseTags, ...titleWords.slice(0, 3)];
  };

  const tags = generateTags();

  const handleBookmarkClick = () => {
    onBookmark?.(article.id);
  };

  const handleReadFullArticle = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(article.url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modern-scrollbar">
        <DialogHeader>
          {/* Article Meta Information */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className={`${getCategoryStyle(article.category)} border-0 font-medium`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="font-medium">{article.source}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatFullDate(article.publishedAt)}</span>
              </div>
            </div>
            
            {/* Article Stats */}
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                <span>{wordCount} {wordCountText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{readingTime} min {readingTimeText}</span>
              </div>
            </div>
          </div>

          {/* Article Title */}
          <DialogTitle className="text-left font-display font-bold text-2xl leading-tight mb-4">
            {translatedTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Image */}
          {article.imageUrl && (
            <div className="relative overflow-hidden rounded-xl group">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-gray max-w-none">
            {article.description && (
              <div className="space-y-6">
                {/* Reading Progress Indicator */}
                <div className="flex items-center gap-3 text-muted-foreground text-sm pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium">Article Preview</span>
                  </div>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span>{wordCount} {wordCountText}</span>
                </div>

                {/* Enhanced Content with Better Typography */}
                <div className="text-foreground leading-relaxed text-base space-y-6">
                  {article.description.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="space-y-4">
                      <p className="text-foreground/90 leading-relaxed">
                        {paragraph.trim()}
                      </p>
                      {index === 0 && article.description.split('\n\n').length > 1 && (
                        <div className="w-24 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Article Tags */}
                {tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Related Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action Card */}
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">Continue Reading</h4>
                      <p className="text-sm text-muted-foreground">
                        Read the full article with all details, images, and updates on the original source.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!article.description && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <ExternalLink className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Full Article Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Click the button below to view the complete story with all details on the source website.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReadFullArticle}
                className="group hover:border-primary hover:text-primary transition-all duration-300"
            >
                <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {readFullText}
            </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="group hover:border-primary hover:text-primary transition-all duration-300"
              >
                <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                {shareText}
              </Button>
            </div>
            
            <Button
              variant={article.isBookmarked ? "default" : "outline"}
              onClick={handleBookmarkClick}
              className={`group transition-all duration-300 ${
                article.isBookmarked 
                  ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl' 
                  : 'hover:border-primary hover:text-primary'
              }`}
            >
              {article.isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  {bookmarkedText}
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  {bookmarkText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};