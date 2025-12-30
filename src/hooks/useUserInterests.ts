import { useState, useEffect } from 'react';
import { UserPreferences, UserInterest } from '@/services/userInterestsService';
import { 
  getUserPreferences, 
  initializeUserPreferences, 
  updateUserInterests,
  updateInterestWeight,
  trackArticleRead,
  trackBookmark
} from '@/services/userInterestsService';
import { useToast } from './use-toast';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const useUserInterests = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoading(true);
          let userPrefs = await getUserPreferences();
          
          if (!userPrefs) {
            userPrefs = await initializeUserPreferences();
          }
          
          setPreferences(userPrefs);
        } catch (error) {
          console.error('Error loading user preferences:', error);
          toast({
            title: "Error loading preferences",
            description: "Failed to load your personalized settings.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setPreferences(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const updateInterests = async (newInterests: UserInterest[]) => {
    if (!preferences) return;

    try {
      await updateUserInterests(newInterests);
      setPreferences(prev => prev ? { ...prev, interests: newInterests } : null);
      
      toast({
        title: "Interests updated",
        description: "Your news preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating interests:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your interests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateInterest = async (category: string, weight: number) => {
    try {
      await updateInterestWeight(category as any, weight);
      
      if (preferences) {
        const updatedInterests = preferences.interests.map(interest =>
          interest.category === category
            ? { ...interest, weight, lastUpdated: new Date() }
            : interest
        );
        
        setPreferences(prev => prev ? { ...prev, interests: updatedInterests } : null);
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your interest preference.",
        variant: "destructive",
      });
    }
  };

  const trackRead = async (articleId: string) => {
    try {
      await trackArticleRead(articleId);
    } catch (error) {
      console.error('Error tracking article read:', error);
    }
  };

  const trackBookmarkCategory = async (category: string) => {
    try {
      await trackBookmark(category as any);
    } catch (error) {
      console.error('Error tracking bookmark category:', error);
    }
  };

  return {
    preferences,
    isLoading,
    updateInterests,
    updateInterest,
    trackRead,
    trackBookmarkCategory,
  };
};
