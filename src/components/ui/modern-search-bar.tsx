import React, { useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchSuggestions } from '@/components/SearchSuggestions';

interface ModernSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

const ModernSearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onSearch,
  onClear,
  className = ""
}: ModernSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    console.log('Suggestion selected:', suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      console.log('Triggering search with:', suggestion);
      onSearch(suggestion);
    }
    inputRef.current?.blur();
  };

  const handleSuggestionClose = () => {
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Minimalist Search Container */}
      <div className="relative group">
        {/* Glass-morphism Search Input */}
        <div className="relative bg-card/90 backdrop-blur-xl border border-card-border/50 rounded-xl shadow-card group-focus-within:shadow-float group-focus-within:border-primary/30 transition-all duration-300">
          {/* Subtle focus glow */}
          <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          
          {/* Search Input */}
          <div className="relative flex items-center px-4 py-3">
            {/* Search Icon */}
            <div className="flex-shrink-0 mr-3">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            </div>

            {/* Input Field */}
            <input 
              ref={inputRef}
              placeholder={placeholder} 
              type="text" 
              name="text" 
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-medium" 
            />

            {/* Clear Button */}
            {value && (
              <button
                onClick={handleClear}
                className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-muted/50 transition-colors duration-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to focus
        </div>
      </div>
      
      {/* Search Suggestions */}
      <SearchSuggestions
        query={value}
        isVisible={showSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        onClose={handleSuggestionClose}
        className="w-full"
      />
    </div>
  );
};

export default ModernSearchBar;
