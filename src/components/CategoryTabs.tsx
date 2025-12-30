import { Globe, Building2, Laptop, Trophy, Film, Heart, Microscope, Bookmark, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NewsCategory = 'all' | 'for-you' | 'world' | 'business' | 'technology' | 'sports' | 'entertainment' | 'health' | 'science' | 'bookmarks';

interface CategoryTabsProps {
  activeCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
}

const categories = [
  { id: 'all' as const, label: 'All News', icon: Globe, className: '' },
  { id: 'for-you' as const, label: 'For You', icon: User, className: 'category-for-you' },
  { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, className: 'category-bookmarks' },
  { id: 'world' as const, label: 'World', icon: Globe, className: 'category-world' },
  { id: 'business' as const, label: 'Business', icon: Building2, className: 'category-business' },
  { id: 'technology' as const, label: 'Technology', icon: Laptop, className: 'category-technology' },
  { id: 'sports' as const, label: 'Sports', icon: Trophy, className: 'category-sports' },
  { id: 'entertainment' as const, label: 'Entertainment', icon: Film, className: 'category-entertainment' },
  { id: 'health' as const, label: 'Health', icon: Heart, className: 'category-health' },
  { id: 'science' as const, label: 'Science', icon: Microscope, className: 'category-science' },
];

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="w-full">
      {/* Desktop Tabs */}
      <div className="hidden md:flex items-center gap-2 p-1 glass-card border border-card-border/50 mx-4 rounded-2xl overflow-x-auto">
        {categories.map(({ id, label, icon: Icon, className }) => (
          <Button
            key={id}
            variant={activeCategory === id ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(id)}
            data-category={id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap smooth-transition
              ${activeCategory === id 
                ? 'luxury-gradient text-primary-foreground shadow-[var(--shadow-luxury)]' 
                : `hover-float ${className}`
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden px-4 py-2">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(({ id, label, icon: Icon, className }) => (
            <Button
              key={id}
              variant={activeCategory === id ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange(id)}
              data-category={id}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap smooth-transition min-w-fit
                ${activeCategory === id 
                  ? 'luxury-gradient text-primary-foreground shadow-[var(--shadow-luxury)]' 
                  : `${className} glass-card border border-card-border/30`
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};