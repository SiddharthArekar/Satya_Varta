import { Globe, User, Bookmark, Building2, Laptop, Trophy, Film, Heart, Microscope } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

// Removed Home, Profile, Settings navigation as requested

// News Categories Navigation
export function NewsCategoryNavBar({ activeCategory, onCategoryChange }: { 
  activeCategory: string
  onCategoryChange: (category: string) => void 
}) {
  const navItems = [
    { name: 'All News', url: '/', icon: Globe, category: 'all' },
    { name: 'For You', url: '/', icon: User, category: 'for-you' },
    { name: 'Bookmarks', url: '/', icon: Bookmark, category: 'bookmarks' },
    { name: 'World', url: '/', icon: Globe, category: 'world' },
    { name: 'Business', url: '/', icon: Building2, category: 'business' },
    { name: 'Tech', url: '/', icon: Laptop, category: 'technology' },
    { name: 'Sports', url: '/', icon: Trophy, category: 'sports' },
    { name: 'Entertainment', url: '/', icon: Film, category: 'entertainment' },
    { name: 'Health', url: '/', icon: Heart, category: 'health' },
    { name: 'Science', url: '/', icon: Microscope, category: 'science' },
  ]

  return (
    <NavBar 
      items={navItems} 
      activeCategory={activeCategory}
      onCategoryChange={onCategoryChange}
    />
  )
}
