import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface MediaContentProps {
  url: string;
  type: 'image' | 'video' | 'gif';
  onLoad?: () => void;
  onError?: () => void;
}

// Media cache with proper cleanup
const mediaCache = new Map<string, {
  blob: Blob;
  objectUrl: string;
  loaded: boolean;
}>();

const MediaContent: React.FC<MediaContentProps> = ({ url, type, onLoad, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>('');
  
  const mountedRef = useRef(true);
  const retryCount = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadMedia = useCallback(async () => {
    if (!url || !mountedRef.current) return;

    try {
      // Check cache first
      const cached = mediaCache.get(url);
      if (cached?.loaded) {
        setObjectUrl(cached.objectUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Handle blob URLs directly
      if (url.startsWith('blob:')) {
        setObjectUrl(url);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        cache: 'force-cache',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const newObjectUrl = URL.createObjectURL(blob);

      if (!mountedRef.current) {
        URL.revokeObjectURL(newObjectUrl);
        return;
      }

      mediaCache.set(url, {
        blob,
        objectUrl: newObjectUrl,
        loaded: true,
      });

      setObjectUrl(newObjectUrl);
      setIsLoading(false);
      setError(null);
      onLoad?.();

    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to load media';
      console.error('Error loading media:', errorMessage);
      
      setError(errorMessage);
      setIsLoading(false);
      onError?.();

      // Retry logic with exponential backoff
      if (retryCount.current < 2) {
        retryCount.current++;
        setTimeout(() => loadMedia(), 1000 * Math.pow(2, retryCount.current));
      }
    }
  }, [url, onLoad, onError]);

  useEffect(() => {
    retryCount.current = 0;
    setIsLoading(true);
    setError(null);
    loadMedia();

    return () => {
      if (objectUrl && !mediaCache.has(url)) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, loadMedia]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-4 p-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-300 text-center">{error}</p>
        <button 
          onClick={() => {
            retryCount.current = 0;
            loadMedia();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-300">Loading media...</p>
        </div>
      </div>
    );
  }

  if (type === 'video' || type === 'gif') {
    return (
      <video
        src={objectUrl}
        className="w-full h-full object-contain"
        autoPlay
        loop
        muted
        playsInline
        onError={() => {
          setError('Failed to load video');
          onError?.();
        }}
      />
    );
  }

  return (
    <img
      src={objectUrl}
      alt=""
      className="w-full h-full object-contain"
      onError={() => {
        setError('Failed to load image');
        onError?.();
      }}
      loading="eager"
      decoding="async"
    />
  );
};

export default MediaContent;