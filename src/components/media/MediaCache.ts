import { nanoid } from 'nanoid';

interface CachedMedia {
  id: string;
  blob: Blob;
  objectUrl: string;
  loaded: boolean;
  timestamp: number;
  retries: number;
}

class MediaCacheManager {
  private cache = new Map<string, CachedMedia>();
  private readonly maxSize = 100;
  private readonly ttl = 30 * 60 * 1000; // 30 minutes
  private readonly maxRetries = 3;
  private cleanupInterval: number | null = null;
  private loadingPromises = new Map<string, Promise<CachedMedia>>();

  constructor() {
    this.startCleanupInterval();
  }

  async get(url: string): Promise<CachedMedia | undefined> {
    // Check if already loading
    const loadingPromise = this.loadingPromises.get(url);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Check cache
    const cached = this.cache.get(url);
    if (cached) {
      if (Date.now() - cached.timestamp > this.ttl) {
        this.remove(url);
        return undefined;
      }
      return cached;
    }

    return undefined;
  }

  async load(url: string): Promise<CachedMedia> {
    // Check if already loading
    let loadingPromise = this.loadingPromises.get(url);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Create new loading promise
    loadingPromise = (async () => {
      try {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const media: CachedMedia = {
          id: nanoid(),
          blob,
          objectUrl: URL.createObjectURL(blob),
          loaded: true,
          timestamp: Date.now(),
          retries: 0,
        };

        if (this.cache.size >= this.maxSize) {
          this.removeOldest();
        }

        this.cache.set(url, media);
        return media;
      } finally {
        this.loadingPromises.delete(url);
      }
    })();

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  remove(url: string): void {
    const item = this.cache.get(url);
    if (item) {
      URL.revokeObjectURL(item.objectUrl);
      this.cache.delete(url);
    }
  }

  private removeOldest(): void {
    const oldest = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    if (oldest) {
      this.remove(oldest[0]);
    }
  }

  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      window.clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = window.setInterval(() => {
      const now = Date.now();
      for (const [url, item] of this.cache.entries()) {
        if (now - item.timestamp > this.ttl) {
          this.remove(url);
        }
      }
    }, 5 * 60 * 1000);
  }

  clear(): void {
    for (const [url] of this.cache.entries()) {
      this.remove(url);
    }
    
    if (this.cleanupInterval) {
      window.clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.loadingPromises.clear();
  }
}

export const mediaCache = new MediaCacheManager();