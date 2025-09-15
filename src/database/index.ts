import 'react-native-get-random-values';
import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

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

// Database type
export type MyDatabase = RxDatabase<{
  businesses: RxCollection<Business>;
  articles: RxCollection<Article>;
}>;

let dbInstance: MyDatabase | null = null;

// Database initialization function
export const initDatabase = async (): Promise<MyDatabase> => {
  // Return existing instance if already initialized
  if (dbInstance) {
    return dbInstance;
  }

  console.log('Starting RxDB initialization...');

  try {
    console.log('Creating database...');

    // Create the database with memory storage
    const db = await createRxDatabase<MyDatabase>({
      name: 'businessarticledb',
      storage: getRxStorageMemory(),
      multiInstance: false,
      ignoreDuplicate: true,
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
    await dbInstance.destroy();
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
};
