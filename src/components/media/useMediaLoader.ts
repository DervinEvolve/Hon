import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaCache } from './MediaCache';

interface UseMediaLoaderProps {
  url: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const useMediaLoader = ({ url, onLoad, onError }: UseMediaLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>('');
  
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<number>();

  const loadMedia = useCallback(async () => {
    if (!url || !mountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Handle blob URLs directly
      if (url.startsWith('blob:')) {
        setObjectUrl(url);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Try to get from cache or load
      const cached = await mediaCache.get(url);
      if (cached?.loaded) {
        setObjectUrl(cached.objectUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Load and cache the media
      const media = await mediaCache.load(url);
      if (!mountedRef.current) return;

      setObjectUrl(media.objectUrl);
      setIsLoading(false);
      onLoad?.();

    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to load media';
      console.error('Error loading media:', errorMessage);
      
      setError(errorMessage);
      setIsLoading(false);
      onError?.();
    }
  }, [url, onLoad, onError]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
    }
    loadMedia();
  }, [url, loadMedia]);

  const retry = useCallback(() => {
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
    }
    loadMedia();
  }, [loadMedia]);

  return { isLoading, error, objectUrl, retry };
};