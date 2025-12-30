import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, 
  ExternalLink, RefreshCw, Quote, Clock, Target, Lightbulb, BarChart3, 
  Calendar, BookOpen, Zap, Brain, Eye, MessageSquare, ArrowRight
} from "lucide-react";
import { NewsArticle } from "./NewsCard";
import { aiSummarizationService, SummarizationResponse } from "@/services/aiSummarizationService";
import { useTranslation } from "@/hooks/useTranslation";

interface AISummaryModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AISummaryModal = ({ article, isOpen, onClose }: AISummaryModalProps) => {
  const [summaryData, setSummaryData] = useState<SummarizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translation hooks
  const { translatedText: aiSummaryText } = useTranslation("AI Summary");
  const { translatedText: generatingText } = useTranslation("Generating AI Summary");
  const { translatedText: analyzingText } = useTranslation("Analyzing article content with Google Gemini AI...");
  const { translatedText: summaryFailedText } = useTranslation("Summary Failed");
  const { translatedText: keyPointsText } = useTranslation("Key Points");
  const { translatedText: sentimentAnalysisText } = useTranslation("Sentiment Analysis");
  const { translatedText: aiConfidenceText } = useTranslation("AI Confidence");
  const { translatedText: readFullArticleText } = useTranslation("Read Full Article");
  const { translatedText: closeText } = useTranslation("Close");
  const { translatedText: regenerateText } = useTranslation("Regenerate");
  const { translatedText: detailedAnalysisText } = useTranslation("Detailed Analysis");
  const { translatedText: importantQuotesText } = useTranslation("Important Quotes");
  const { translatedText: timelineText } = useTranslation("Timeline");
  const { translatedText: impactText } = useTranslation("Impact Assessment");
  const { translatedText: implicationsText } = useTranslation("Implications");
  const { translatedText: readingLevelText } = useTranslation("Reading Level");
  const { translatedText: executiveSummaryText } = useTranslation("Executive Summary");

  useEffect(() => {
    if (isOpen && article) {
      generateSummary();
    } else {
      setSummaryData(null);
      setError(null);
    }
  }, [isOpen, article]);

  const generateSummary = async () => {
    if (!article) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiSummarizationService.summarizeArticle({
        title: article.title,
        content: article.description || '',
        url: article.url,
        category: article.category
      });

      if (result.success) {
        setSummaryData(result);
      } else {
        setError(result.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Summary generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    generateSummary();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getReadingLevelColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const getReadingLevelIcon = (level: string) => {
    switch (level) {
      case 'basic':
        return <BookOpen className="h-4 w-4" />;
      case 'advanced':
        return <Brain className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto modern-scrollbar p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          
          <DialogHeader className="relative px-8 pt-8 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-primary">{aiSummaryText}</h2>
                    <p className="text-xs text-muted-foreground">Powered by Google Gemini AI</p>
                  </div>
                </div>
                <Badge variant="secondary" className="border-0 font-medium text-xs">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </Badge>
              </div>
              {summaryData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30"
                >
                  <RefreshCw className="h-4 w-4" />
                  {regenerateText}
                </Button>
              )}
            </div>
            
            <DialogTitle className="text-left font-display font-bold text-2xl leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {article.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto px-8 pb-8 space-y-8 custom-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <Sparkles className="h-5 w-5 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-xl">{generatingText}</h3>
                  <p className="text-muted-foreground">
                    {analyzingText}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-600">{summaryFailedText}</h4>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="text-red-600 border-red-500/30 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {summaryData && summaryData.success && (
            <div className="space-y-8">
              {/* Executive Summary */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 shadow-lg">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  {executiveSummaryText}
                </h3>
                <p className="text-foreground leading-relaxed text-lg font-medium">
                  {summaryData.summary}
                </p>
              </div>

              {/* Detailed Analysis */}
              {summaryData.detailedSummary && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent border border-blue-500/10">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-blue-500" />
                    </div>
                    {detailedAnalysisText}
                  </h3>
                  <p className="text-foreground leading-relaxed text-base">
                    {summaryData.detailedSummary}
                  </p>
                </div>
              )}

              {/* Key Points */}
              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    {keyPointsText}
                  </h3>
                  <div className="grid gap-4">
                    {summaryData.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/3 border border-green-500/10 hover:from-green-500/10 hover:to-green-500/5 transition-all duration-300">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-600">
                          {index + 1}
                        </div>
                        <p className="text-foreground leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Quotes */}
              {summaryData.importantQuotes && summaryData.importantQuotes.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Quote className="h-4 w-4 text-purple-500" />
                    </div>
                    {importantQuotesText}
                  </h3>
                  <div className="space-y-4">
                    {summaryData.importantQuotes.map((quote, index) => (
                      <div key={index} className="p-6 rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-500/3 border-l-4 border-purple-500/30">
                        <p className="text-foreground italic leading-relaxed">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {summaryData.timeline && summaryData.timeline.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    {timelineText}
                  </h3>
                  <div className="space-y-3">
                    {summaryData.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-orange-500/5 to-orange-500/3 border border-orange-500/10">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-xs font-semibold text-orange-600">
                          {index + 1}
                        </div>
                        <p className="text-foreground leading-relaxed">{event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Assessment */}
              {summaryData.impact && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/5 via-red-500/3 to-transparent border border-red-500/10">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-red-500" />
                    </div>
                    {impactText}
                  </h3>
                  <p className="text-foreground leading-relaxed text-base">
                    {summaryData.impact}
                  </p>
                </div>
              )}

              {/* Implications */}
              {summaryData.implications && summaryData.implications.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    </div>
                    {implicationsText}
                  </h3>
                  <div className="space-y-4">
                    {summaryData.implications.map((implication, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-yellow-500/5 to-yellow-500/3 border border-yellow-500/10">
                        <ArrowRight className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <p className="text-foreground leading-relaxed">{implication}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sentiment Analysis */}
                {summaryData.sentiment && (
                  <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      {getSentimentIcon(summaryData.sentiment)}
                      {sentimentAnalysisText}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={getSentimentColor(summaryData.sentiment)}
                    >
                      {summaryData.sentiment.charAt(0).toUpperCase() + summaryData.sentiment.slice(1)}
                    </Badge>
                  </div>
                )}

                {/* Confidence Score */}
                {summaryData.confidence && (
                  <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {aiConfidenceText}
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${(summaryData.confidence / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {summaryData.confidence}/10
                      </span>
                    </div>
                  </div>
                )}

                {/* Reading Level */}
                {summaryData.readingLevel && (
                  <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      {getReadingLevelIcon(summaryData.readingLevel)}
                      {readingLevelText}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={getReadingLevelColor(summaryData.readingLevel)}
                    >
                      {summaryData.readingLevel.charAt(0).toUpperCase() + summaryData.readingLevel.slice(1)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modern Sticky Footer */}
        <div className="sticky bottom-0 px-8 py-6 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                className="group hover:border-primary hover:text-primary transition-all duration-300 bg-white/50 dark:bg-black/50"
              >
                <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                {readFullArticleText}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Powered by</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary">Google Gemini AI</span>
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="group hover:bg-muted/50 transition-colors"
            >
              {closeText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
