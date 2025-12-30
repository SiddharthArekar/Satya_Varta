import React, { useRef, useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchSuggestions } from '@/components/SearchSuggestions';

interface AnimatedGlowingSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

const AnimatedGlowingSearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onSearch,
  onClear,
  className = ""
}: AnimatedGlowingSearchBarProps) => {
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
    onChange(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
    inputRef.current?.blur();
  };

  const handleSuggestionClose = () => {
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute z-[-1] w-full h-min-screen"></div>
      <div id="poda" className="relative flex items-center justify-center group">
        {/* Outer glow layers - using project's primary colors */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[70px] max-w-[500px] rounded-xl blur-[3px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60
                        before:bg-[conic-gradient(hsl(var(--background)),hsl(var(--primary))_5%,hsl(var(--background))_38%,hsl(var(--background))_50%,hsl(var(--accent))_60%,hsl(var(--background))_87%)] before:transition-all before:duration-2000
                        group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[495px] rounded-xl blur-[3px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]
                        before:bg-[conic-gradient(rgba(0,0,0,0),hsl(var(--primary-muted)),rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,hsl(var(--accent)),rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000
                        group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[495px] rounded-xl blur-[3px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]
                        before:bg-[conic-gradient(rgba(0,0,0,0),hsl(var(--primary-muted)),rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,hsl(var(--accent)),rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000
                        group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[495px] rounded-xl blur-[3px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]
                        before:bg-[conic-gradient(rgba(0,0,0,0),hsl(var(--primary-muted)),rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,hsl(var(--accent)),rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000
                        group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>

        {/* Inner glow layers */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[63px] max-w-[490px] rounded-lg blur-[2px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg]
                        before:bg-[conic-gradient(rgba(0,0,0,0)_0%,hsl(var(--primary-muted)),rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,hsl(var(--accent)),rgba(0,0,0,0)_58%)] before:brightness-140
                        before:transition-all before:duration-2000 group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>

        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[59px] max-w-[485px] rounded-xl blur-[0.5px] 
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-70
                        before:bg-[conic-gradient(hsl(var(--card)),hsl(var(--primary))_5%,hsl(var(--card))_14%,hsl(var(--card))_50%,hsl(var(--accent))_60%,hsl(var(--card))_64%)] before:brightness-130
                        before:transition-all before:duration-2000 group-hover:before:rotate-[-110deg] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-&lsqb;4000ms&rsqb;">
        </div>

        {/* Main input container */}
        <div id="main" className="relative group">
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
            className="bg-card/90 backdrop-blur-xl border border-card-border/50 w-[480px] h-[56px] rounded-xl text-foreground px-[59px] pr-[100px] text-lg focus:outline-none placeholder-muted-foreground smooth-transition focus:shadow-[var(--shadow-float)]" 
          />
          <div id="input-mask" className="pointer-events-none w-[100px] h-[20px] absolute bg-gradient-to-r from-transparent to-card top-[18px] left-[70px] group-focus-within:hidden"></div>
          <div id="accent-mask" className="pointer-events-none w-[30px] h-[20px] absolute bg-accent top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-2000 group-hover:opacity-0"></div>
          
          {/* Animated filter icon */}
          <div className="absolute h-[42px] w-[40px] overflow-hidden top-[7px] right-[7px] rounded-lg
                          before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90
                          before:bg-[conic-gradient(rgba(0,0,0,0),hsl(var(--muted)),rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,hsl(var(--muted)),rgba(0,0,0,0)_100%)]
                          before:brightness-135 before:animate-spin-slow">
          </div>
          
          {/* Clear icon */}
          {value && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-12 flex items-center justify-center z-[2] h-10 w-10 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}

          {/* Filter icon */}
          <div id="filter-icon" className="absolute top-2 right-2 flex items-center justify-center z-[2] max-h-10 max-w-[38px] h-full w-full [isolation:isolate] overflow-hidden rounded-lg bg-gradient-to-b from-card via-card to-card border border-card-border/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Search icon */}
          <div id="search-icon" className="absolute left-5 top-[15px]">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* Search Suggestions */}
      <SearchSuggestions
        query={value}
        isVisible={showSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        onClose={handleSuggestionClose}
        className="w-full max-w-[480px]"
      />
    </div>
  );
};

export default AnimatedGlowingSearchBar;
