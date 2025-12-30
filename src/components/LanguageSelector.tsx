import { Languages, Check, Globe, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, getTranslationStats } from "@/services/translationService";
import { useState, useEffect } from "react";

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage, isTranslating } = useLanguage();
  const [translationStats, setTranslationStats] = useState(getTranslationStats());

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      setTranslationStats(getTranslationStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover-float gap-2 relative"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          <span className="hidden sm:inline font-medium">
            {currentLanguage.nativeName}
          </span>
          {isTranslating && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>Select Language</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language)}
            className="flex items-center justify-between cursor-pointer hover:bg-accent"
          >
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">{language.name}</span>
            </div>
            {currentLanguage.code === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>AI Translation Active</span>
          </div>
          <div className="text-xs mt-1">
            {translationStats.cacheSize} cached translations
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};