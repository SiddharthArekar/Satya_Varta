import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, CheckCircle, ExternalLink } from "lucide-react";
import { NewsArticle } from "./NewsCard";
import { NewsSummary } from "@/services/summaryService";
import { NewsCategory } from "./CategoryTabs";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

interface SummaryModalProps {
  article: NewsArticle | null;
  summary: NewsSummary | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onReadFull: () => void;
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

export const SummaryModal = ({ 
  article, 
  summary, 
  isOpen, 
  isLoading, 
  onClose, 
  onReadFull 
}: SummaryModalProps) => {
  const { currentLanguage } = useLanguage();
  const { translatedText: summaryText } = useTranslation("30-Second Summary");
  const { translatedText: keyPointsText } = useTranslation("Key Points");
  const { translatedText: keyTakeawaysText } = useTranslation("Key Takeaways");
  const { translatedText: readFullText } = useTranslation("Read Full Article");
  const { translatedText: generatingText } = useTranslation("Generating AI summary...");
  const { translatedText: poweredByText } = useTranslation("Powered by AI • Instant summaries");
  const { translatedText: translatedTitle } = useTranslation(article?.title || "");
  
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-3">
            <Badge 
              variant="secondary" 
              className={`${getCategoryStyle(article.category)} border-0 font-medium`}
            >
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">{summaryText}</span>
            </div>
          </div>
          <DialogTitle className="text-left font-display font-bold text-xl leading-tight">
            {translatedTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {summary && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{summary.readTime}</span>
              </div>
            )}
          </div>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="overflow-hidden rounded-xl">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-48 md:h-64 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <span>{generatingText}</span>
              </div>
            </div>
          )}

          {/* Summary Content */}
          {summary && !isLoading && (
            <div className="space-y-6">
              {/* Bullet Points */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {keyPointsText}
                </h3>
                <ul className="space-y-3">
                  {summary.bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-foreground leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Takeaways */}
              {summary.keyTakeaways.length > 0 && (
                <div className="space-y-4 p-4 bg-accent/20 rounded-xl border border-accent/30">
                  <h3 className="font-display font-semibold text-base text-accent-foreground">
                    💡 {keyTakeawaysText}
                  </h3>
                  <ul className="space-y-2">
                    {summary.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="text-accent-foreground text-sm leading-relaxed">
                        • {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-card-border/50">
            <Button
              variant="outline"
              onClick={onReadFull}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {readFullText}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {poweredByText}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};