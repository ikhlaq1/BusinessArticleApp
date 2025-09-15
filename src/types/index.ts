export interface Business {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Article Model Interface (without RxDB fields)
export interface Article {
  id: string;
  name: string;
  qty: number;
  selling_price: number;
  business_id: string;
  createdAt: number;
  updatedAt: number;
}

// RxDB Document types (these are what RxDB actually uses)
export type BusinessDocument = Business;
export type ArticleDocument = Article;

// Database Collections
export interface DatabaseCollections {
  businesses: any; // Will be typed with RxCollection later
  articles: any; // Will be typed with RxCollection later
}

// Sync Status
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  error: string | null;
}
