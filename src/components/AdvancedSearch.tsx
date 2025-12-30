import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X, Globe, Clock, SortAsc, SortDesc } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NewsCategory } from "@/components/CategoryTabs";
import { NewsSearchOptions } from "@/services/enhancedNewsService";
import { getAPIStatus } from "@/services/newsService";

interface AdvancedSearchProps {
  onSearch: (options: NewsSearchOptions) => void;
  onClear: () => void;
  isLoading?: boolean;
  className?: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'it', label: 'Italy' },
  { value: 'es', label: 'Spain' },
  { value: 'in', label: 'India' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'cn', label: 'China' },
  { value: 'br', label: 'Brazil' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ru', label: 'Russia' },
];

const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Published Date' },
  { value: 'relevancy', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
];

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'world', label: 'World' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
];

const POPULAR_SOURCES = [
  'bbc-news',
  'cnn',
  'reuters',
  'bloomberg',
  'techcrunch',
  'espn',
  'the-guardian',
  'the-new-york-times',
  'washington-post',
  'usa-today',
];

export const AdvancedSearch = ({ onSearch, onClear, isLoading = false, className }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchOptions, setSearchOptions] = useState<NewsSearchOptions>({
    query: '',
    category: 'all',
    language: 'en',
    country: 'us',
    sortBy: 'publishedAt',
    pageSize: 20,
  });
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [excludeDomains, setExcludeDomains] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<Record<string, any>>({});

  useEffect(() => {
    const status = getAPIStatus();
    setApiStatus(status);
  }, []);

  const handleSearch = () => {
    const options: NewsSearchOptions = {
      ...searchOptions,
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      toDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      excludeDomains: excludeDomains.length > 0 ? excludeDomains : undefined,
    };
    onSearch(options);
  };

  const handleClear = () => {
    setSearchOptions({
      query: '',
      category: 'all',
      language: 'en',
      country: 'us',
      sortBy: 'publishedAt',
      pageSize: 20,
    });
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedSources([]);
    setExcludeDomains([]);
    onClear();
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleExcludeDomain = (domain: string) => {
    setExcludeDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchOptions.query) count++;
    if (searchOptions.category !== 'all') count++;
    if (searchOptions.language !== 'en') count++;
    if (searchOptions.country !== 'us') count++;
    if (searchOptions.sortBy !== 'publishedAt') count++;
    if (fromDate) count++;
    if (toDate) count++;
    if (selectedSources.length > 0) count++;
    if (excludeDomains.length > 0) count++;
    return count;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search & Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {getActiveFiltersCount()} filters
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover-float"
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search for news articles..."
                value={searchOptions.query || ''}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, query: e.target.value }))}
                className="w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="hover-float"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading}
              className="hover-float"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={searchOptions.category}
              onValueChange={(value) => setSearchOptions(prev => ({ ...prev, category: value as NewsCategory }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchOptions.language}
              onValueChange={(value) => setSearchOptions(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchOptions.country}
              onValueChange={(value) => setSearchOptions(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchOptions.sortBy}
              onValueChange={(value) => setSearchOptions(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((sort) => (
                  <SelectItem key={sort.value} value={sort.value}>
                    {sort.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date Range
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sources
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Include Sources</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {POPULAR_SOURCES.map((source) => (
                        <Badge
                          key={source}
                          variant={selectedSources.includes(source) ? "default" : "outline"}
                          className="cursor-pointer hover-float"
                          onClick={() => toggleSource(source)}
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Exclude Domains</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['example.com', 'spam.com', 'fake-news.com'].map((domain) => (
                        <Badge
                          key={domain}
                          variant={excludeDomains.includes(domain) ? "destructive" : "outline"}
                          className="cursor-pointer hover-float"
                          onClick={() => toggleExcludeDomain(domain)}
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                API Status
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(apiStatus).map(([apiName, status]) => (
                  <div key={apiName} className="flex items-center gap-2 p-2 rounded-lg border">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      status.enabled ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span className="text-sm font-medium capitalize">{apiName}</span>
                    <Badge variant="outline" className="text-xs">
                      {status.requests}/{status.rateLimit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
