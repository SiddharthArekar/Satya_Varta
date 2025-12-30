import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Clock, Star, Tag, ChevronRight } from 'lucide-react';
import { SearchSuggestion, searchSuggestionsService } from '@/services/searchSuggestionsService';
import { Button } from '@/components/ui/button';

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  isVisible,
  onSuggestionSelect,
  onClose,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Load suggestions based on query
  useEffect(() => {
    if (!isVisible) return;

    setIsLoading(true);
    
    // Simulate async loading for better UX
    const timer = setTimeout(() => {
      const newSuggestions = searchSuggestionsService.getSuggestions(query, 10);
      setSuggestions(newSuggestions);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [query, isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onSuggestionSelect(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSuggestionSelect, onClose]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    searchSuggestionsService.addRecentSearch(suggestion.text);
    onSuggestionSelect(suggestion.text);
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'recent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'popular':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'category':
        return <Tag className="h-4 w-4 text-green-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get badge color for suggestion type
  const getBadgeColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'trending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'recent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'popular':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'category':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isVisible || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute top-full left-0 right-0 z-50 mt-2 bg-card/95 backdrop-blur-xl border border-card-border/50 rounded-xl shadow-card ${className}`}
    >
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Loading suggestions...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Suggestions header */}
            {query === '' && (
              <div className="px-3 py-2 border-b border-card-border/30 mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Trending & Recent
                </h3>
              </div>
            )}

            {/* Suggestions list */}
            {suggestions.map((suggestion, index) => (
              <Button
                key={suggestion.id}
                ref={(el) => (suggestionRefs.current[index] = el)}
                variant="ghost"
                className={`w-full justify-start h-auto p-3 text-left hover:bg-muted/50 rounded-lg transition-colors duration-200 ${
                  selectedIndex === index ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center space-x-3 w-full">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {suggestion.text}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(suggestion.type)}`}>
                        {suggestion.type}
                      </span>
                    </div>
                    {suggestion.category && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.category}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            ))}

            {/* Footer with clear recent searches */}
            {query === '' && suggestions.some(s => s.type === 'recent') && (
              <div className="px-3 py-2 border-t border-card-border/30 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200"
                  onClick={() => {
                    searchSuggestionsService.clearRecentSearches();
                    setSuggestions(prev => prev.filter(s => s.type !== 'recent'));
                  }}
                >
                  Clear recent searches
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
