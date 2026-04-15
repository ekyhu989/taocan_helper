export interface OfflineCacheData {
  emergencySchemes: any[];
  lastSync: Date | null;
}

const OFFLINE_CACHE_KEY = 'taocang_offline_cache';

const DEFAULT_CACHE: OfflineCacheData = {
  emergencySchemes: [],
  lastSync: null
};

export function getOfflineCache(): OfflineCacheData {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_CACHE;
  }

  try {
    const saved = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null
      };
    }
  } catch {
    console.error('Failed to read offline cache');
  }

  return DEFAULT_CACHE;
}

export function saveOfflineCache(data: Partial<OfflineCacheData>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const currentCache = getOfflineCache();
    const newCache = {
      ...currentCache,
      ...data,
      lastSync: new Date()
    };
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(newCache));
  } catch (error) {
    console.error('Failed to save offline cache:', error);
  }
}

export function addEmergencySchemeToCache(scheme: any): void {
  const cache = getOfflineCache();
  saveOfflineCache({
    emergencySchemes: [scheme, ...cache.emergencySchemes]
  });
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

export function exportToFile(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
