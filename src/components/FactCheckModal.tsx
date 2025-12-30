import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CredibilityScore, FactCheckResult } from '@/services/factCheckService';
import { NewsArticle } from '@/components/NewsCard';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Info,
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Users,
  Calendar,
  BookOpen,
  Lightbulb,
  Zap,
  Award,
  Globe
} from 'lucide-react';

interface FactCheckModalProps {
  article: NewsArticle | null;
  credibilityScore: CredibilityScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FactCheckModal = ({ 
  article, 
  credibilityScore, 
  isOpen, 
  onClose 
}: FactCheckModalProps) => {
  if (!article || !credibilityScore) return null;

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FALSE': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'MIXED': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return 'text-green-600 bg-green-50 border-green-200';
      case 'FALSE': return 'text-red-600 bg-red-50 border-red-200';
      case 'MIXED': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrustTrend = (score: number) => {
    if (score >= 80) return { 
      icon: TrendingUp, 
      text: 'High Trust', 
      color: 'text-green-600',
      explanation: 'This source has a strong reputation for accuracy and reliability. The content appears to be well-researched and factually sound.',
      badge: 'Excellent'
    };
    if (score >= 60) return { 
      icon: TrendingUp, 
      text: 'Medium Trust', 
      color: 'text-yellow-600',
      explanation: 'This source is generally reliable but may have occasional inaccuracies. The content appears credible but should be cross-verified.',
      badge: 'Good'
    };
    if (score >= 40) return { 
      icon: TrendingDown, 
      text: 'Low Trust', 
      color: 'text-orange-600',
      explanation: 'This source has mixed reliability. While some content may be accurate, there are concerns about bias or factual accuracy.',
      badge: 'Caution'
    };
    return { 
      icon: TrendingDown, 
      text: 'Questionable', 
      color: 'text-red-600',
      explanation: 'This source has significant credibility issues. The content should be treated with skepticism and verified from other reliable sources.',
      badge: 'Warning'
    };
  };

  const getNaturalVerdict = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return {
        text: 'Verified as True',
        explanation: 'This claim has been fact-checked and confirmed to be accurate by reliable sources.',
        color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20 dark:text-green-400',
        icon: CheckCircle
      };
      case 'FALSE': return {
        text: 'Verified as False',
        explanation: 'This claim has been fact-checked and found to be inaccurate or misleading.',
        color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400',
        icon: XCircle
      };
      case 'MIXED': return {
        text: 'Partially True',
        explanation: 'This claim contains both accurate and inaccurate elements. Some parts are true while others are misleading.',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400',
        icon: AlertTriangle
      };
      default: return {
        text: 'Unverified',
        explanation: 'This claim has not been fully fact-checked yet. The information should be treated with caution.',
        color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400',
        icon: Info
      };
    }
  };

  const getSourceReliabilityText = (score: number) => {
    if (score >= 80) return 'This is a highly reputable news source with a strong track record of accuracy and journalistic integrity.';
    if (score >= 60) return 'This is a generally reliable news source, though it may have occasional biases or inaccuracies.';
    if (score >= 40) return 'This source has mixed reliability with some credibility concerns that should be considered.';
    return 'This source has significant credibility issues and should be approached with caution.';
  };

  const trustTrend = getTrustTrend(credibilityScore.overall);
  const TrendIcon = trustTrend.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto modern-scrollbar p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 opacity-50"></div>
          
          <DialogHeader className="relative px-8 pt-8 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fact Check Report
          </DialogTitle>
                  <p className="text-sm text-muted-foreground">Comprehensive credibility analysis powered by AI</p>
                </div>
              </div>
              <Badge 
                variant={credibilityScore.overall >= 60 ? 'default' : 'destructive'}
                className="text-sm font-semibold px-4 py-2"
              >
                {trustTrend.badge}
              </Badge>
            </div>
        </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto px-8 pb-8 space-y-8 custom-scrollbar">
          {/* Article Information */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent border border-blue-500/10">
            <h3 className="font-semibold text-xl mb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              Article Under Review
            </h3>
            <h4 className="font-medium text-lg leading-relaxed mb-4 text-foreground">
              {article.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium">{article.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Published:</span>
                <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {/* Overall Trust Assessment */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/5 via-green-500/3 to-transparent border border-green-500/10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <TrendIcon className={`h-6 w-6 ${trustTrend.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-foreground">Overall Trust Assessment</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive credibility analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${trustTrend.color} mb-2`}>
                  {credibilityScore.overall}%
                </div>
                <Badge 
                  variant={credibilityScore.overall >= 60 ? 'default' : 'destructive'}
                  className="text-sm font-semibold px-4 py-2"
                >
                  {trustTrend.badge}
                </Badge>
              </div>
            </div>

            {/* Trust Explanation */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-green-500/20 mb-6">
              <p className="text-foreground leading-relaxed">
                <strong>What this means:</strong> {trustTrend.explanation}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-background rounded-full h-4 mb-6 shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-1000 shadow-lg ${
                  credibilityScore.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  credibilityScore.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  credibilityScore.overall >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${credibilityScore.overall}%` }}
              />
            </div>

            {/* Detailed Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Source Reliability</h4>
                    <div className={`text-2xl font-bold ${credibilityScore.sourceReliability >= 70 ? 'text-green-600' : credibilityScore.sourceReliability >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {credibilityScore.sourceReliability}%
                    </div>
                </div>
              </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getSourceReliabilityText(credibilityScore.sourceReliability)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Fact Check Status</h4>
                    <div className={`text-2xl font-bold ${credibilityScore.factCheckStatus >= 70 ? 'text-green-600' : credibilityScore.factCheckStatus >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {credibilityScore.factCheckStatus}%
                    </div>
                </div>
              </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {credibilityScore.details.hasFactCheck 
                    ? 'This content has been verified by independent fact-checking organizations.' 
                    : 'This content has not been independently fact-checked yet.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Content Freshness</h4>
                    <div className={`text-2xl font-bold ${credibilityScore.recency >= 70 ? 'text-green-600' : credibilityScore.recency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {credibilityScore.recency}%
                </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This content is recent and up-to-date, which generally increases its reliability.
                </p>
              </div>
            </div>
          </div>

          {/* Fact Check Results */}
          {credibilityScore.details.hasFactCheck && credibilityScore.details.factCheckResults.length > 0 ? (
            <div className="space-y-6">
              <h3 className="font-semibold text-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                Independent Fact Check Results
              </h3>
              
              <div className="space-y-6">
                {credibilityScore.details.factCheckResults.map((result, index) => {
                  const verdict = getNaturalVerdict(result.verdict);
                  const VerdictIcon = verdict.icon;
                  
                  return (
                    <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-gray-500/5 via-gray-500/3 to-transparent border border-border/50 hover:border-border transition-all duration-300">
                      <div className="flex items-start justify-between gap-6 mb-4">
                      <div className="flex-1">
                          <h5 className="font-semibold text-lg leading-relaxed mb-3 text-foreground">
                            {result.claim}
                          </h5>
                          <p className="text-foreground/80 leading-relaxed mb-4">
                            {result.explanation}
                          </p>
                      </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${verdict.color}`}>
                            <VerdictIcon className="h-4 w-4" />
                            <span className="font-semibold text-sm">{verdict.text}</span>
                        </div>
                          <div className="text-xs text-muted-foreground text-center">
                            <div className="font-medium">{Math.round(result.confidence * 100)}% confidence</div>
                            <div className="text-xs opacity-75">in this assessment</div>
                        </div>
                      </div>
                    </div>
                    
                      {/* Verdict Explanation */}
                      <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/30 mb-4">
                        <p className="text-sm text-foreground leading-relaxed">
                          <strong>What this means:</strong> {verdict.explanation}
                        </p>
                      </div>
                      
                      {/* Source Information */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Fact-checked by:</span>
                        <span className="font-medium">{result.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                              {new Date(result.publishedDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                        </span>
                          </div>
                        </div>
                        {result.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Full Report
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-2">No Independent Fact Checks Available</h4>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                This article hasn't been independently fact-checked yet. Our trust assessment is based on source reliability, content analysis, and other credibility factors.
              </p>
            </div>
          )}

          {/* Source Information */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent border border-blue-500/10">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              Source Information & Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">News Source</span>
                  </div>
                  <div className="font-semibold text-lg">{article.source}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getSourceReliabilityText(credibilityScore.sourceReliability)}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Trust Level</span>
              </div>
                  <Badge 
                    variant={credibilityScore.details.sourceTrustLevel === 'HIGH' ? 'default' : 'secondary'}
                    className="text-sm font-semibold"
                  >
                    {credibilityScore.details.sourceTrustLevel} RELIABILITY
                </Badge>
              </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Reliability Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${credibilityScore.sourceReliability >= 70 ? 'text-green-600' : credibilityScore.sourceReliability >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {credibilityScore.sourceReliability}%
                  </div>
              </div>
                
              {credibilityScore.details.lastVerified && (
                  <div className="p-4 rounded-xl bg-white/30 dark:bg-black/10 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Last Verified</span>
                    </div>
                    <div className="font-medium">
                      {credibilityScore.details.lastVerified.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Important Disclaimer */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/5 via-yellow-500/3 to-transparent border border-yellow-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                  Important Disclaimer
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                  This fact-check report is generated using automated analysis and trusted sources. 
                  While we strive for accuracy, always verify important information from multiple reliable sources 
                  and use your judgment when consuming news. This analysis is for informational purposes only 
                  and should not be considered as definitive proof of content accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Sticky Footer */}
        <div className="sticky bottom-0 px-8 py-6 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Powered by AI Fact-Checking Technology</span>
              <Shield className="h-3 w-3 text-primary" />
            </div>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-muted/50 transition-colors"
            >
              Close Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
