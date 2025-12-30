import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth } from '@/firebaseConfig';
import { NewsCategory } from '@/components/CategoryTabs';

export interface UserInterest {
  category: NewsCategory;
  weight: number; // 0-1, how much user likes this category
  lastUpdated: Date;
}

export interface UserPreferences {
  interests: UserInterest[];
  readingHistory: string[]; // article IDs
  bookmarkedCategories: NewsCategory[];
  preferredSources: string[];
  lastUpdated: Date;
}

const DEFAULT_INTERESTS: UserInterest[] = [
  { category: 'technology', weight: 0.8, lastUpdated: new Date() },
  { category: 'world', weight: 0.7, lastUpdated: new Date() },
  { category: 'business', weight: 0.6, lastUpdated: new Date() },
];

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  if (!auth.currentUser) return null;

  try {
    const userDoc = await getDoc(doc(db, 'userPreferences', auth.currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        interests: data.interests || DEFAULT_INTERESTS,
        readingHistory: data.readingHistory || [],
        bookmarkedCategories: data.bookmarkedCategories || [],
        preferredSources: data.preferredSources || [],
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      } as UserPreferences;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
};

export const initializeUserPreferences = async (): Promise<UserPreferences> => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const preferences: UserPreferences = {
    interests: DEFAULT_INTERESTS,
    readingHistory: [],
    bookmarkedCategories: [],
    preferredSources: [],
    lastUpdated: new Date(),
  };

  try {
    await setDoc(doc(db, 'userPreferences', auth.currentUser.uid), {
      ...preferences,
      lastUpdated: new Date(),
    });
    return preferences;
  } catch (error) {
    console.error('Error initializing user preferences:', error);
    throw error;
  }
};

export const updateUserInterests = async (interests: UserInterest[]): Promise<void> => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    await updateDoc(doc(db, 'userPreferences', auth.currentUser.uid), {
      interests,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error updating user interests:', error);
    throw error;
  }
};

export const trackArticleRead = async (articleId: string): Promise<void> => {
  if (!auth.currentUser) return;

  try {
    const userDoc = doc(db, 'userPreferences', auth.currentUser.uid);
    await updateDoc(userDoc, {
      readingHistory: arrayUnion(articleId),
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error tracking article read:', error);
  }
};

export const trackBookmark = async (category: NewsCategory): Promise<void> => {
  if (!auth.currentUser) return;

  try {
    const userDoc = doc(db, 'userPreferences', auth.currentUser.uid);
    await updateDoc(userDoc, {
      bookmarkedCategories: arrayUnion(category),
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error tracking bookmark:', error);
  }
};

export const updateInterestWeight = async (category: NewsCategory, weight: number): Promise<void> => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const preferences = await getUserPreferences();
    if (!preferences) return;

    const updatedInterests = preferences.interests.map(interest => 
      interest.category === category 
        ? { ...interest, weight: Math.max(0, Math.min(1, weight)), lastUpdated: new Date() }
        : interest
    );

    // If category doesn't exist, add it
    if (!updatedInterests.some(i => i.category === category)) {
      updatedInterests.push({
        category,
        weight: Math.max(0, Math.min(1, weight)),
        lastUpdated: new Date(),
      });
    }

    await updateUserInterests(updatedInterests);
  } catch (error) {
    console.error('Error updating interest weight:', error);
    throw error;
  }
};
