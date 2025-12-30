import { useState, useEffect, useCallback, useRef } from 'react';

interface UseImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  category: string;
}

// Global image cache to prevent duplicate loading
const imageCache = new Map<string, { src: string; loaded: boolean; error: boolean; loading: boolean }>();

export const useImageWithFallback = ({ src, fallbackSrc, category }: UseImageWithFallbackProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  const loadImage = useCallback(async (url: string): Promise<boolean> => {
    // Check cache first
    const cached = imageCache.get(url);
    if (cached) {
      if (cached.loaded) {
        setImageSrc(url);
        setIsLoading(false);
        setHasError(false);
        return true;
      } else if (cached.error && cached.loading === false) {
        return false;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Mark as loading in cache
      imageCache.set(url, { src: url, loaded: false, error: false, loading: true });

      // Try multiple methods to load the image
      let imageLoaded = false;

      // Method 1: Try direct image loading first (fastest)
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const loadPromise = new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

        // Add timeout for image loading
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 5000); // 5 second timeout
        });

        imageLoaded = await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        console.warn('Direct image loading failed, trying fetch method:', error);
      }

      // Method 2: If direct loading failed, try fetch with different strategies
      if (!imageLoaded) {
        try {
          // Try with different fetch options
          const fetchOptions = [
            { method: 'GET', mode: 'cors' as RequestMode },
            { method: 'GET', mode: 'no-cors' as RequestMode },
            { method: 'HEAD', mode: 'cors' as RequestMode }
          ];

          for (const options of fetchOptions) {
            try {
              const response = await fetch(url, {
                ...options,
                signal: abortControllerRef.current.signal,
                headers: {
                  'Accept': 'image/*',
                  'Cache-Control': 'no-cache'
                }
              });

              if (response.ok || response.type === 'opaque') {
                imageLoaded = true;
                break;
              }
            } catch (fetchError) {
              // Continue to next method
              continue;
            }
          }
        } catch (error) {
          console.warn('Fetch method failed:', error);
        }
      }

      if (imageLoaded) {
        // Image is accessible, cache the success
        imageCache.set(url, { src: url, loaded: true, error: false, loading: false });
        setImageSrc(url);
        setIsLoading(false);
        setHasError(false);
        setRetryCount(0);
        return true;
      } else {
        throw new Error('All image loading methods failed');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return false; // Request was cancelled
      }
      
      // Cache the error
      imageCache.set(url, { src: url, loaded: false, error: true, loading: false });
      return false;
    }
  }, []);

  useEffect(() => {
    if (!src || src.trim() === '') {
      // Only use fallback if no source provided
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Reset states
    setIsLoading(true);
    setHasError(false);

    // Try to load the original image
    loadImage(src).then((success) => {
      if (!success && retryCount < maxRetries) {
        // Retry loading with exponential backoff
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadImage(src).then((retrySuccess) => {
            if (!retrySuccess) {
              // Only use fallback after all retries failed
              setImageSrc(fallbackSrc);
              setIsLoading(false);
              setHasError(true);
            }
          });
        }, retryDelay);
      } else if (!success) {
        // All retries failed, use fallback
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
      }
    });

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [src, fallbackSrc, loadImage, retryCount]);

  const retry = useCallback(() => {
    if (src && src.trim() !== '') {
      setRetryCount(0);
      setIsLoading(true);
      setHasError(false);
      loadImage(src).then((success) => {
        if (!success) {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
          setHasError(true);
        }
      });
    }
  }, [src, fallbackSrc, loadImage]);

  return {
    imageSrc,
    isLoading,
    hasError,
    retry
  };
};
