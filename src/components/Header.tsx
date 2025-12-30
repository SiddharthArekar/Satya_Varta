import { useState, useEffect } from 'react';
import { Search, Menu, Bell, User, Settings, LogOut, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationSettings } from '@/components/NotificationSettings';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import ModernSearchBar from "@/components/ui/modern-search-bar";
import { useTranslation } from "@/hooks/useTranslation";
import { useBreakingNews } from '@/hooks/useBreakingNews';
import { AuthModal } from './AuthModal';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { NewsSearchOptions } from '@/services/enhancedNewsService';

interface HeaderProps {
  onMenuClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
  onAdvancedSearch?: (options: NewsSearchOptions) => void;
}

export const Header = ({ onMenuClick, searchQuery, onSearchChange, onSearch, onClearSearch, onAdvancedSearch }: HeaderProps) => {
  const { translatedText: searchPlaceholder } = useTranslation("Search news...");
  const { isMonitoring, breakingNews, permission } = useBreakingNews();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-card-border/50 mx-4 mt-4 rounded-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden hover-float"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
                <img src='/logo.png' alt='SatyaVarta Logo' className="h-8 w-8" />
                <h1 className="font-display font-bold text-xl text-foreground">
                    SatyaVarta
                </h1>
            </div>
          </div>

          {/* Modern Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <ModernSearchBar
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearch}
              onClear={onClearSearch}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            
            {/* Advanced Search */}
            <Dialog open={advancedSearchOpen} onOpenChange={setAdvancedSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hover-float">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <AdvancedSearch
                  onSearch={(options) => {
                    onAdvancedSearch?.(options);
                    setAdvancedSearchOpen(false);
                  }}
                  onClear={() => {
                    onClearSearch?.();
                    setAdvancedSearchOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
            
            {/* Notification Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hover-float relative">
                  <Bell className="h-4 w-4" />
                  {isMonitoring && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  {breakingNews.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {breakingNews.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <NotificationSettings onClose={() => setSettingsOpen(false)} />
              </DialogContent>
            </Dialog>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => setAuthModalOpen(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Modern Search */}
        <div className="md:hidden mt-4">
          <ModernSearchBar
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearch}
            onClear={onClearSearch}
            className="w-full"
          />
        </div>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};