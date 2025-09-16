import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { createSQLiteAdapter } from './sqlite-adapter';

// Add dev-mode plugin for better error messages in development
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { replicateCouchDB } from 'rxdb/plugins/replication-couchdb';
import { RxReplicationState } from 'rxdb/plugins/replication';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { couchDBSync } from '../services/couchdbSync';
// Enable dev mode in development
if (__DEV__) {
  addRxPlugin(RxDBDevModePlugin);
}

// Add required plugins
addRxPlugin(RxDBQueryBuilderPlugin);

// Import schemas
import {
  businessSchema,
  businessDocumentMethods,
  businessCollectionMethods,
} from './schemas/business.schema';
import {
  articleSchema,
  articleDocumentMethods,
  articleCollectionMethods,
} from './schemas/article.schema';
import { Business, Article } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { clearSQLiteDatabase, getSQLiteDatabaseInfo } from './sqlite-adapter';
import QuickCrypto from 'react-native-quick-crypto';

// Database type
export type MyDatabase = RxDatabase<{
  businesses: RxCollection<Business>;
  articles: RxCollection<Article>;
}>;

let dbInstance: MyDatabase | null = null;

// Custom hash function for React Native
const customHashFunction = async (data: string): Promise<string> => {
  const hash = QuickCrypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};

// Database initialization function
export const initDatabase = async (): Promise<MyDatabase> => {
  // Return existing instance if already initialized
  if (dbInstance) {
    return dbInstance;
  }

  console.log('Starting RxDB initialization...');

  try {
    console.log('Creating database...');

    // Create the database with SQLite storage wrapped with validation
    const storage = wrappedValidateAjvStorage({
      storage: createSQLiteAdapter(),
    });

    const db = await createRxDatabase<MyDatabase>({
      name: 'businessarticledb',
      storage,
      multiInstance: false,
      ignoreDuplicate: true,
      hashFunction: customHashFunction,
    });

    console.log('Database created, adding collections...');

    // Log schemas to debug
    console.log('Business schema:', JSON.stringify(businessSchema, null, 2));
    console.log('Article schema:', JSON.stringify(articleSchema, null, 2));

    // Add collections with error handling for each
    try {
      await db.addCollections({
        businesses: {
          schema: businessSchema,
          methods: businessDocumentMethods || {},
          statics: businessCollectionMethods || {},
        },
      });
      console.log('Business collection added');
    } catch (error) {
      console.error('Error adding business collection:', error);
      throw error;
    }

    try {
      await db.addCollections({
        articles: {
          schema: articleSchema,
          methods: articleDocumentMethods || {},
          statics: articleCollectionMethods || {},
        },
      });
      console.log('Article collection added');
    } catch (error) {
      console.error('Error adding article collection:', error);
      throw error;
    }

    console.log('All collections added successfully');

    // Store the instance
    dbInstance = db;

    console.log(
      'Database ready with collections:',
      Object.keys(db.collections),
    );

    return db;
  } catch (error: any) {
    console.error('Database initialization failed:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    throw error;
  }
};
export const startCouchDBSync = async () => {
  return await couchDBSync.startSync();
};
export const stopCouchDBSync = async () => {
  return await couchDBSync.stopSync();
};
// Get database instance
export const getDatabase = async (): Promise<MyDatabase> => {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
};

// Close database
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.remove();
    dbInstance = null;
  }
};

// Helper functions for CRUD operations
export const DatabaseService = {
  // Business operations
  async createBusiness(name: string): Promise<any> {
    try {
      const db = await getDatabase();
      const id = uuidv4();
      const now = Date.now();

      console.log('Creating business with data:', {
        id,
        name,
        createdAt: now,
        updatedAt: now,
      });

      const business = await db.businesses.insert({
        id,
        name,
        createdAt: now,
        updatedAt: now,
      });

      console.log('Business created successfully:', business);
      return business;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  async getAllBusinesses(): Promise<Business[]> {
    try {
      const db = await getDatabase();
      const businesses = await db.businesses.find().exec();
      return businesses.map(b => b.toJSON());
    } catch (error) {
      console.error('Error getting businesses:', error);
      throw error;
    }
  },

  // Article operations
  async createArticle(
    name: string,
    qty: number,
    selling_price: number,
    business_id: string,
  ): Promise<any> {
    try {
      const db = await getDatabase();
      const id = uuidv4();
      const now = Date.now();

      console.log('Creating article with data:', {
        id,
        name,
        qty,
        selling_price,
        business_id,
        createdAt: now,
        updatedAt: now,
      });

      const article = await db.articles.insert({
        id,
        name,
        qty,
        selling_price,
        business_id,
        createdAt: now,
        updatedAt: now,
      });

      console.log('Article created successfully:', article);
      return article;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  async getArticlesByBusiness(businessId: string): Promise<Article[]> {
    try {
      const db = await getDatabase();
      const articles = await db.articles
        .find({
          selector: {
            business_id: businessId,
          },
        })
        .exec();
      return articles.map(a => a.toJSON());
    } catch (error) {
      console.error('Error getting articles:', error);
      throw error;
    }
  },

  // Database management operations
  async clearDatabase(): Promise<void> {
    try {
      await clearSQLiteDatabase();
      // Reset the database instance to force re-initialization
      if (dbInstance) {
        await dbInstance.remove();
        dbInstance = null;
      }
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  },

  async getDatabaseInfo(): Promise<{ [key: string]: number }> {
    try {
      const info = await getSQLiteDatabaseInfo();
      console.log('Database info:', info);
      return info;
    } catch (error) {
      console.error('Error getting database info:', error);
      throw error;
    }
  },
};
