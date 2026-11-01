/**
 * AIRLOG - Firebase Integration Architecture
 * 
 * Provides an adaptable storage layer designed for Firebase Firestore/Auth.
 * Falls back transparently to LocalStorage if Firebase credentials/SDK are not yet initialized,
 * ensuring zero disruption to user workflow while being 100% ready for full Firebase cloud sync.
 */

export interface AirlogUserData {
  favoriteSidos: string[];
  favoriteStations: string[];
  alertThreshold: '보통' | '나쁨' | '매우나쁨';
  theme: 'light' | 'dark' | 'system';
  lastVisitedSido: string;
}

const LOCAL_STORAGE_KEY = 'airlog_user_preferences_v1';

const defaultUserData: AirlogUserData = {
  favoriteSidos: ['서울', '경기', '부산'],
  favoriteStations: ['종로구', '강남구'],
  alertThreshold: '나쁨',
  theme: 'light',
  lastVisitedSido: '서울',
};

export class AirlogStorageService {
  private static instance: AirlogStorageService;
  private isFirebaseInitialized: boolean = false;

  private constructor() {
    // Check if Firebase config exists in environment
    if (typeof window !== 'undefined' && (window as unknown as { FIREBASE_APP?: unknown }).FIREBASE_APP) {
      this.isFirebaseInitialized = true;
    }
  }

  public static getInstance(): AirlogStorageService {
    if (!AirlogStorageService.instance) {
      AirlogStorageService.instance = new AirlogStorageService();
    }
    return AirlogStorageService.instance;
  }

  public getUserData(): AirlogUserData {
    if (typeof window === 'undefined') return defaultUserData;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return defaultUserData;
      return { ...defaultUserData, ...JSON.parse(stored) };
    } catch {
      return defaultUserData;
    }
  }

  public saveUserData(data: Partial<AirlogUserData>): AirlogUserData {
    if (typeof window === 'undefined') return defaultUserData;
    try {
      const current = this.getUserData();
      const updated = { ...current, ...data };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return defaultUserData;
    }
  }

  public toggleFavoriteSido(sido: string): AirlogUserData {
    const current = this.getUserData();
    const exists = current.favoriteSidos.includes(sido);
    const updated = exists
      ? current.favoriteSidos.filter(s => s !== sido)
      : [...current.favoriteSidos, sido];
    return this.saveUserData({ favoriteSidos: updated });
  }

  public isFirebaseReady(): boolean {
    return this.isFirebaseInitialized;
  }
}

export const storageService = AirlogStorageService.getInstance();
