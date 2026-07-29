import { type FirebaseApp, type FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore, initializeFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// forceLongPolling works around Firestore's default transport frequently failing to reach the
// backend on RN/Hermes. Do not remove without confirming Firestore reads/writes work on Android.
export function initFirebase(config: FirebaseOptions, authInstance?: Auth, forceLongPolling?: boolean) {
  app = getApps().length ? getApps()[0]! : initializeApp(config);
  auth = authInstance ?? getAuth(app);
  db = forceLongPolling
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        // Not in the public FirestoreSettings type here, but required alongside forceLongPolling on Hermes.
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
