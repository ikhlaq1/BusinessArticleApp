import { getRxStorageSQLiteTrial } from 'rxdb/plugins/storage-sqlite';
import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import type {
  SQLiteQueryWithParams,
  SQLResultRow,
  SQLiteBasics,
} from 'rxdb/plugins/storage-sqlite';

// SQLite database connection cache
const connectionCache: { [name: string]: QuickSQLiteConnection } = {};

/**
 * Creates and returns an RxDB SQLite storage adapter for React Native
 * using react-native-quick-sqlite as the underlying SQLite implementation
 */
export const createSQLiteAdapter = () => {
  console.log('Creating SQLite adapter...');

  const sqliteBasics: SQLiteBasics<QuickSQLiteConnection> = {
    // Open database connection
    open: async (name: string) => {
      if (!connectionCache[name]) {
        connectionCache[name] = open({ name });
        console.log('SQLite database opened:', name);
      }
      return connectionCache[name];
    },

    // Close database connection
    close: async (db: QuickSQLiteConnection) => {
      try {
        db.close();
        // Remove from cache
        const dbName = Object.keys(connectionCache).find(
          key => connectionCache[key] === db,
        );
        if (dbName) {
          delete connectionCache[dbName];
        }
        console.log('SQLite database closed');
      } catch (error) {
        console.error('Error closing database:', error);
      }
    },

    // Execute a SQL statement that doesn't return data
    run: async (
      db: QuickSQLiteConnection,
      queryWithParams: SQLiteQueryWithParams,
    ) => {
      try {
        const { query, params } = queryWithParams;
        db.execute(query, params || []);
      } catch (error) {
        console.error('SQLite run error:', error);
        console.error('Query:', queryWithParams.query);
        console.error('Params:', queryWithParams.params);
        throw error;
      }
    },

    // Execute a SQL query that returns data
    all: async (
      db: QuickSQLiteConnection,
      queryWithParams: SQLiteQueryWithParams,
    ): Promise<SQLResultRow[]> => {
      try {
        const { query, params } = queryWithParams;
        const result = db.execute(query, params || []);

        // Convert the result to the format expected by RxDB
        const rows = result.rows?._array || [];

        // RxDB expects rows in a specific format
        return rows.map((row: any) => {
          // If the row has id and data fields, return as is
          if (row.id && row.data) {
            return row as SQLResultRow;
          }
          // Otherwise, try to format it correctly
          return {
            id: row.id || '',
            data: row.data || JSON.stringify(row),
          };
        });
      } catch (error) {
        console.error('SQLite all error:', error);
        console.error('Query:', queryWithParams.query);
        console.error('Params:', queryWithParams.params);
        throw error;
      }
    },

    // Set pragma for SQLite configuration
    setPragma: async (
      db: QuickSQLiteConnection,
      key: string,
      value: string,
    ) => {
      try {
        const query = `PRAGMA ${key} = ${value}`;
        db.execute(query);
        console.log(`Set pragma: ${key} = ${value}`);
      } catch (error) {
        console.error('Error setting pragma:', error);
        throw error;
      }
    },

    // Journal mode - empty string means leave untouched
    journalMode: '',
  };

  try {
    const storage = getRxStorageSQLiteTrial({
      sqliteBasics,
      storeAttachmentsAsBase64String: true,
      log: console.log.bind(console),
    });
    console.log('SQLite storage created successfully');
    return storage;
  } catch (error) {
    console.error('Error creating SQLite storage:', error);
    throw error;
  }
};

/**
 * Helper function to clear all data from SQLite database
 * Useful for testing or resetting the database
 */
export const clearSQLiteDatabase = async () => {
  try {
    const dbName = 'businessarticledb.sqlite';
    let connection = connectionCache[dbName];

    if (!connection) {
      connection = open({ name: dbName });
    }

    // Get all table names
    const tables = connection.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );

    // Drop each table
    if (tables.rows?._array) {
      for (const table of tables.rows._array) {
        connection.execute(`DROP TABLE IF EXISTS ${table.name}`);
        console.log(`Dropped table: ${table.name}`);
      }
    }

    console.log('SQLite database cleared');
  } catch (error) {
    console.error('Error clearing SQLite database:', error);
    throw error;
  }
};

/**
 * Helper function to get database info
 * Returns information about tables and their row counts
 */
export const getSQLiteDatabaseInfo = async () => {
  try {
    const dbName = 'businessarticledb.sqlite';
    let connection = connectionCache[dbName];

    if (!connection) {
      connection = open({ name: dbName });
    }

    // Get all table names
    const tables = connection.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );

    const info: { [key: string]: number } = {};

    if (tables.rows?._array) {
      for (const table of tables.rows._array) {
        const count = connection.execute(
          `SELECT COUNT(*) as count FROM ${table.name}`,
        );
        info[table.name] = count.rows?._array?.[0]?.count || 0;
      }
    }

    return info;
  } catch (error) {
    console.error('Error getting SQLite database info:', error);
    throw error;
  }
};
