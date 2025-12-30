import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateText } from '@/services/translationService';

export const useTranslation = (text: string) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    if (currentLanguage.code === 'en') {
      setTranslatedText(text);
      return;
    }

    let isCancelled = false;
    
    const performTranslation = async () => {
      setIsLoading(true);
      try {
        const result = await translateText(text, currentLanguage.code);
        if (!isCancelled) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        if (!isCancelled) {
          setTranslatedText(text); // Fallback to original text
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    performTranslation();

    return () => {
      isCancelled = true;
    };
  }, [text, currentLanguage.code]);

  return { translatedText, isLoading };
};

// Hook for translating multiple texts
export const useTranslations = (texts: string[]) => {
  const { currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!texts.length) {
      setTranslatedTexts([]);
      return;
    }

    if (currentLanguage.code === 'en') {
      setTranslatedTexts(texts);
      return;
    }

    let isCancelled = false;
    
    const performTranslations = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          texts.map(text => translateText(text, currentLanguage.code))
        );
        if (!isCancelled) {
          setTranslatedTexts(results);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        if (!isCancelled) {
          setTranslatedTexts(texts); // Fallback to original texts
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    performTranslations();

    return () => {
      isCancelled = true;
    };
  }, [texts, currentLanguage.code]);

  return { translatedTexts, isLoading };
};