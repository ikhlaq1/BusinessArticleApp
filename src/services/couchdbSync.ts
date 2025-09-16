import 'cross-fetch/polyfill';
import { RxReplicationState } from 'rxdb/plugins/replication';
import {
  replicateCouchDB,
  getFetchWithCouchDBAuthorization,
} from 'rxdb/plugins/replication-couchdb';
import { getDatabase } from '../database';
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
        collection: db.businesses,
        url: `https://database-production-9f7e.up.railway.app/businesses/`,
        fetch: fetchWithAuth, // Use the authorized fetch
        live: true,
        retry: true,
        pull: {},
        push: {},
      });

      // Setup article collection replication
      this.articleReplication = await replicateCouchDB({
        collection: db.articles,
        url: `https://database-production-9f7e.up.railway.app/articles/`,
        fetch: fetchWithAuth, // Use the authorized fetch
        live: true,
        retry: true,
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
}

export const couchDBSync = new CouchDBSyncService();
