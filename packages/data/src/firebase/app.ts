import { type FirebaseApp, type FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore, initializeFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/**
 * `authInstance` lets a platform (e.g. React Native) hand in an Auth instance
 * built with its own persistence layer (AsyncStorage) instead of the default,
 * since that setup requires a platform-specific import this shared package
 * can't reference directly without breaking the web bundle.
 *
 * `forceLongPolling` works around a well-known Firestore-on-React-Native issue:
 * the SDK's default streaming transport (fetch-based WebChannel) frequently
 * fails to reach the backend on RN/Hermes with a "didn't respond within 10
 * seconds" error, even on a healthy connection. Long-polling avoids that.
 */
export function initFirebase(config: FirebaseOptions, authInstance?: Auth, forceLongPolling?: boolean) {
  app = getApps().length ? getApps()[0]! : initializeApp(config);
  auth = authInstance ?? getAuth(app);
  db = forceLongPolling
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        // Not in the public FirestoreSettings type in this SDK version, but the
        // runtime settings object does support it and it's the standard companion
        // fix for "could not reach backend" on Hermes — fetch's streaming Response
        // body isn't fully supported there, which otherwise silently breaks the
        // long-polling transport too.
        ...({ useFetchStreams: false } as object),
      })
    : getFirestore(app);
  storage = getStorage(app);
  return { app, auth, db, storage };
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error("Firebase not initialized — call initFirebase() first");
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) throw new Error("Firebase not initialized — call initFirebase() first");
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) throw new Error("Firebase not initialized — call initFirebase() first");
  return storage;
}
