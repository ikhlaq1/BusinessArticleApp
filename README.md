# Getting Started

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### Demo

You can view a demo of the app [here](https://drive.google.com/file/d/1TsKwbx9VeLH8AGIbpPkB5WC4xFzOU_Ng/view?usp=sharing).
Download APK here  [here](https://drive.google.com/file/d/1BmCdMq3lPO9ZOInNV7Ulpar5GCpbAw5L/view?usp=sharing).

---

## Architecture Decisions

- **Offline-first**: All reads/writes hit local RxDB first, guaranteeing instant UX and resilience to connectivity loss.
- **SQLite storage**: On mobile, SQLite is the most reliable local persistence layer. We implemented a custom adapter around `react-native-quick-sqlite` to satisfy RxDB’s `SQLiteBasics` interface.
- **Live replication**: Two collections (`businesses`, `articles`) replicate to CouchDB using RxDB’s `replicateCouchDB`, with separate `replicationIdentifier`s.
- **Network-aware lifecycle**: A hook (`useCouchDBSync`) starts replication when online and cancels it when offline.
- **UI observability**: A `SyncStatus` component exposes a simple status line to the user.

---

### Technology Stack

- **React Native** (TypeScript) - Mobile framework
- **RxDB** - Reactive database for offline-first functionality
- **SQLite** - Local storage engine via react-native-quick-sqlite
- **CouchDB** - Cloud database for synchronization
- **React Navigation** - Screen navigation
- **NetInfo** - Network state detection

---

### Data Flow

  1. User creates/reads data → RxDB (local SQLite)
  2. RxDB detects network status via NetInfo
  3. When online → RxDB syncs with CouchDB
  4. When offline → Data stays in local SQLite
  5. On reconnection → Automatic sync resumes

## Implementation Details

### 1) Custom SQLite adapter for RxDB (i don't have premium rxdb)

File: `src/database/sqlite-adapter.ts`

Key points:

- Uses `react-native-quick-sqlite` for fast, native SQLite.
- Implements RxDB `SQLiteBasics` (`open`, `close`, `run`, `all`, `setPragma`, `journalMode`).
- Caches connections per database name to avoid repeated opens.
- Converts query results to RxDB’s expected `{ id, data }` shape when needed.
- Exposes helpers: `clearSQLiteDatabase()` and `getSQLiteDatabaseInfo()`.

### 2) Database initialization and schemas

File: `src/database/index.ts`

- Wraps the SQLite storage with AJV validation via `wrappedValidateAjvStorage`.
- Creates database `businessarticledb`, adds collections, and exposes `getDatabase()`.
- Exports `startCouchDBSync()` and `stopCouchDBSync()` which delegate to the sync service.

Schemas:

- `src/database/schemas/business.schema.ts`
- `src/database/schemas/article.schema.ts`

### 3) CouchDB replication service

File: `src/services/couchdbSync.ts`

- Uses `replicateCouchDB` with `replicationIdentifier`, `live: true`, and the collection + remote URL.
- Auth via `getFetchWithCouchDBAuthorization(username, password)`.
- Subscribes to `error$` streams for visibility.

### 4) Network-aware sync lifecycle

File: `src/hooks/useCouchDBSync.ts`

- Listens to `@react-native-community/netinfo`.
- When online: starts sync and sets status `syncing` → `synced`.
- When offline: cancels sync and sets status `offline`.

### 5) UI visibility

File: `src/components/SyncStatus.tsx`

- Maps status to icon + message: `syncing`, `synced`, `offline`, `error`, `idle`.

---

# Deploying CouchDB on Railway

I used Railway’s CouchDB template to deploy a managed CouchDB instance.

- Template: [CouchDB on Railway](https://railway.com/new/template/eRC98l)
- After deployment, we noted the public base URL and created two databases.

Create databases via `curl`:

```bash
curl -X PUT https://admin:5NuomdtPJVnE@database-production-9f7e.up.railway.app/businesses
curl -X PUT https://admin:5NuomdtPJVnE@database-production-9f7e.up.railway.app/articles
```
