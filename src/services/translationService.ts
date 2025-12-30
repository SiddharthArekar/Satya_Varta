// Translation service for AI-powered multi-language support using Google Translate API
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

// Google Translate API configuration
const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyDDeT0ZvC95987LjES5cgHWFttSy-YnWgk';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

// Cache for translated content
const translationCache = new Map<string, string>();

const getCacheKey = (text: string, targetLang: string): string => {
  return `${targetLang}:${text.substring(0, 100)}`;
};

// Google Translate API function
const translateWithGoogle = async (text: string, targetLang: string): Promise<string> => {
  try {
    console.log(`🌐 Translating to ${targetLang}:`, text.substring(0, 50) + '...');
    
    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: 'en',
        format: 'text'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Translate API error:', errorData);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText;
    
    if (translatedText) {
      console.log(`✅ Translation successful:`, translatedText.substring(0, 50) + '...');
      return translatedText;
    } else {
      console.warn('No translation returned, using original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

// Main translation function
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text || targetLang === 'en') return text;
  
  const cacheKey = getCacheKey(text, targetLang);
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    console.log(`📋 Using cached translation for: ${text.substring(0, 30)}...`);
    return translationCache.get(cacheKey)!;
  }
  
  try {
    const translatedText = await translateWithGoogle(text, targetLang);
    
    // Cache the result
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

// Batch translation for multiple texts
export const translateTexts = async (texts: string[], targetLang: string): Promise<string[]> => {
  if (targetLang === 'en') return texts;
  
  const results = await Promise.all(
    texts.map(text => translateText(text, targetLang))
  );
  
  return results;
};

// Clear translation cache
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

// Detect language of text
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_URL}/detect?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.detections?.[0]?.[0]?.language || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
};

// Get supported languages from Google Translate
export const getSupportedLanguages = async (): Promise<Language[]> => {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_URL}/languages?key=${GOOGLE_TRANSLATE_API_KEY}&target=en`);
    
    if (!response.ok) {
      throw new Error(`Languages API error: ${response.status}`);
    }

    const data = await response.json();
    const googleLanguages = data.data?.languages || [];
    
    // Merge with our predefined languages, prioritizing our list
    const mergedLanguages = [...SUPPORTED_LANGUAGES];
    
    googleLanguages.forEach((lang: any) => {
      if (!mergedLanguages.find(l => l.code === lang.language)) {
        mergedLanguages.push({
          code: lang.language,
          name: lang.name,
          nativeName: lang.name
        });
      }
    });
    
    return mergedLanguages;
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return SUPPORTED_LANGUAGES; // Fallback to our predefined list
  }
};

// Translate news article content
export const translateArticle = async (article: any, targetLang: string) => {
  if (targetLang === 'en') return article;
  
  try {
    const [translatedTitle, translatedDescription] = await Promise.all([
      translateText(article.title, targetLang),
      translateText(article.description, targetLang)
    ]);
    
    return {
      ...article,
      title: translatedTitle,
      description: translatedDescription,
      originalTitle: article.title,
      originalDescription: article.description,
      translatedLanguage: targetLang
    };
  } catch (error) {
    console.error('Error translating article:', error);
    return article;
  }
};

// Get translation statistics
export const getTranslationStats = () => {
  return {
    cacheSize: translationCache.size,
    supportedLanguages: SUPPORTED_LANGUAGES.length,
    apiKey: GOOGLE_TRANSLATE_API_KEY ? 'Configured' : 'Not configured'
  };
};