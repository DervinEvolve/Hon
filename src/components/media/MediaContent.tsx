import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface MediaContentProps {
  url: string;
  type: 'image' | 'video' | 'gif';
  onLoad?: () => void;
  onError?: () => void;
}

const MediaContent: React.FC<MediaContentProps> = ({ url, type, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    setError(null);
  }, [url]);

  const handleLoad = () => {
    if (mountedRef.current) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleError = () => {
    if (mountedRef.current) {
      setError('Failed to load media');
      onError?.();
    }
  };

  const handleRetry = () => {
    if (mediaRef.current) {
      setError(null);
      setIsLoaded(false);
      mediaRef.current.src = url;
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-4 p-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-300 text-center">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (type === 'video' || type === 'gif') {
    return (
      <div className="relative w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={url}
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleLoad}
          onError={handleError}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        ref={mediaRef as React.RefObject<HTMLImageElement>}
        src={url}
        alt=""
        className="w-full h-full object-contain"
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: isLoaded ? 1 : 0 }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

export default React.memo(MediaContent);