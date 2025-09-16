import 'cross-fetch/polyfill';
import { RxReplicationState } from 'rxdb/plugins/replication';
import {
  replicateCouchDB,
  getFetchWithCouchDBAuthorization,
} from 'rxdb/plugins/replication-couchdb';
import { getDatabase, DatabaseService } from '../database';
import { Business, Article } from '../types';

export class CouchDBSyncService {
  private businessReplication: RxReplicationState<Business, any> | null = null;
  private articleReplication: RxReplicationState<Article, any> | null = null;
  private isRunning: boolean = false;

  async startSync() {
    if (this.isRunning) {
      console.log('Sync already running');
      return;
    }

    try {
      console.log('🚀 Starting CouchDB sync...');
      const db = await getDatabase();

      // Use the built-in authorization helper
      const fetchWithAuth = getFetchWithCouchDBAuthorization(
        'admin',
        '5NuomdtPJVnE',
      );

      // Setup business collection replication
      this.businessReplication = await replicateCouchDB({
        replicationIdentifier: 'businesses-sync',
        collection: db.businesses,
        url: `https://database-production-9f7e.up.railway.app/businesses/`,
        fetch: fetchWithAuth, // Use the authorized fetch
        live: true,
        pull: {},
        push: {},
      });

      // Setup article collection replication
      this.articleReplication = await replicateCouchDB({
        replicationIdentifier: 'articles-sync',
        collection: db.articles,
        url: `https://database-production-9f7e.up.railway.app/articles/`,
        fetch: fetchWithAuth, // Use the authorized fetch
        live: true,
        pull: {},
        push: {},
      });

      this.isRunning = true;

      // Monitor sync status
      if (this.businessReplication.error$) {
        this.businessReplication.error$.subscribe(error => {
          console.error('Business sync error:', error);
        });
      }

      if (this.articleReplication.error$) {
        this.articleReplication.error$.subscribe(error => {
          console.error('Article sync error:', error);
        });
      }

      console.log('✅ CouchDB sync started successfully');

      return {
        businessReplication: this.businessReplication,
        articleReplication: this.articleReplication,
      };
    } catch (error) {
      console.error('❌ Failed to start sync:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stopSync() {
    console.log('Stopping CouchDB sync...');

    if (this.businessReplication) {
      await this.businessReplication.cancel();
      this.businessReplication = null;
    }

    if (this.articleReplication) {
      await this.articleReplication.cancel();
      this.articleReplication = null;
    }

    this.isRunning = false;
    console.log('CouchDB sync stopped');
  }

  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      businessActive: this.businessReplication?.active$,
      articleActive: this.articleReplication?.active$,
    };
  }

  /**
   * Fully deletes replication state including checkpoints/meta.
   * Useful for resetting sync or switching servers/users.
   */
  async deleteSync() {
    console.log('Deleting CouchDB sync (including checkpoints)...');

    // Ensure replication is running so deletions can be pushed upstream
    if (
      !this.isRunning ||
      !this.businessReplication ||
      !this.articleReplication
    ) {
      await this.startSync();
    }

    // Delete local docs via RxDB so replication can push tombstones
    try {
      const db = await getDatabase();
      const [businessDocs, articleDocs] = await Promise.all([
        db.businesses.find().exec(),
        db.articles.find().exec(),
      ]);

      await Promise.all([
        ...businessDocs.map(doc => doc.remove()),
        ...articleDocs.map(doc => doc.remove()),
      ]);

      // Wait until replication has pushed all deletions
      await Promise.all([
        this.businessReplication?.awaitInSync(),
        this.articleReplication?.awaitInSync(),
      ]);
      console.log('Pushed deletions to CouchDB');
    } catch (err) {
      console.error('Error deleting and syncing documents:', err);
      // Continue with best-effort cleanup
    }

    // Remove replication states to clear checkpoints/meta
    try {
      if (this.businessReplication) {
        await this.businessReplication.remove();
      }
      if (this.articleReplication) {
        await this.articleReplication.remove();
      }
    } catch (err) {
      console.error('Error removing replication states:', err);
    } finally {
      this.businessReplication = null;
      this.articleReplication = null;
      this.isRunning = false;
      console.log('CouchDB replication deleted');
    }

    // Clear local SQLite data to fully reset offline state
    try {
      await DatabaseService.clearDatabase();
      console.log('Local SQLite database cleared');
    } catch (err) {
      console.error('Error clearing local SQLite database:', err);
      throw err;
    }
  }
}

export const couchDBSync = new CouchDBSyncService();
