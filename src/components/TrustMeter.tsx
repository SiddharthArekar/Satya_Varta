import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CredibilityScore } from '@/services/factCheckService';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TrustMeterProps {
  score: CredibilityScore;
  onViewDetails?: () => void;
  compact?: boolean;
}

export const TrustMeter = ({ score, onViewDetails, compact = false }: TrustMeterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return Shield;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const getTrustLevel = (score: number) => {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Medium Trust';
    if (score >= 40) return 'Low Trust';
    return 'Questionable';
  };

  const getTrustBadgeVariant = (score: number) => {
    if (score >= 80) return 'default' as const;
    if (score >= 60) return 'secondary' as const;
    if (score >= 40) return 'outline' as const;
    return 'destructive' as const;
  };

  const ScoreIcon = getScoreIcon(score.overall);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <ScoreIcon className={`h-4 w-4 ${getScoreColor(score.overall)}`} />
          <span className={`text-sm font-medium ${getScoreColor(score.overall)}`}>
            {score.overall}%
          </span>
        </div>
        <Badge variant={getTrustBadgeVariant(score.overall)} className="text-xs">
          {getTrustLevel(score.overall)}
        </Badge>
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="h-6 px-2 text-xs"
          >
            Details
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScoreIcon className={`h-6 w-6 ${getScoreColor(score.overall)}`} />
              <div>
                <h3 className="font-semibold text-lg">Trust Score</h3>
                <p className="text-sm text-muted-foreground">
                  {getTrustLevel(score.overall)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}%
              </div>
              <Badge variant={getTrustBadgeVariant(score.overall)}>
                {getTrustLevel(score.overall)}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credibility</span>
              <span>{score.overall}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  score.overall >= 80 ? 'bg-green-500' :
                  score.overall >= 60 ? 'bg-yellow-500' :
                  score.overall >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${score.overall}%` }}
              />
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Source</div>
              <div className="font-semibold">{score.sourceReliability}%</div>
              <div className="text-xs">
                {score.details.sourceTrustLevel}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Fact Check</div>
              <div className="font-semibold">{score.factCheckStatus}%</div>
              <div className="text-xs">
                {score.details.hasFactCheck ? 'Verified' : 'Not Checked'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Recency</div>
              <div className="font-semibold">{score.recency}%</div>
              <div className="text-xs flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Fresh
              </div>
            </div>
          </div>

          {/* Fact Check Results */}
          {score.details.hasFactCheck && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Fact Check Results</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 px-2 text-xs"
                >
                  {isExpanded ? 'Hide' : 'Show'} Details
                </Button>
              </div>
              
              {isExpanded && (
                <div className="space-y-2">
                  {score.details.factCheckResults.map((result, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-2">
                            {result.claim}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {result.explanation}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              result.verdict === 'TRUE' ? 'default' :
                              result.verdict === 'FALSE' ? 'destructive' :
                              result.verdict === 'MIXED' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {result.verdict}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(result.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                      {result.url && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="h-6 px-2 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Source
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {onViewDetails && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="w-full"
              >
                View Full Report
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
