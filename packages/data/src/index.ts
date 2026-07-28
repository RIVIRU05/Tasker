import type { FirebaseOptions } from "firebase/app";
import type { Auth } from "firebase/auth";
import { MockTaskHubClient } from "./mockClient";
import { FirebaseTaskHubClient } from "./firebaseClient";
import { initFirebase } from "./firebase/app";
import { uploadPhoto as uploadPhotoToFirebase, deletePhotoByUrl as deletePhotoByUrlFromFirebase } from "./firebase/storage";
import type { TaskHubClient } from "./client";

export * from "./client";
export { MockTaskHubClient } from "./mockClient";
export { FirebaseTaskHubClient } from "./firebaseClient";

let mode: "mock" | "firebase" = "mock";
let client: TaskHubClient | null = null;

/**
 * Call once at app startup (before any getClient() calls) to switch off mock data.
 * Each app reads its own env vars (NEXT_PUBLIC_* for web, EXPO_PUBLIC_* for mobile)
 * and passes them in here, since a shared package can't rely on either bundler's
 * env-var inlining convention directly.
 */
export function configure(options: {
  useMock: boolean;
  firebaseConfig?: FirebaseOptions;
  authInstance?: Auth;
  forceLongPolling?: boolean;
}) {
  mode = options.useMock ? "mock" : "firebase";
  if (!options.useMock && options.firebaseConfig) {
    initFirebase(options.firebaseConfig, options.authInstance, options.forceLongPolling);
  }
  client = null;
}

export function getClient(): TaskHubClient {
  if (!client) {
    client = mode === "mock" ? new MockTaskHubClient() : new FirebaseTaskHubClient();
  }
  return client;
}

export function isMock(): boolean {
  return mode === "mock";
}

/**
 * Uploads a photo to Firebase Storage and returns its download URL. Only
 * call this in Firebase mode — mock mode has no real Storage backend, so
 * callers should branch on isMock() and use a local file reference instead
 * (e.g. URL.createObjectURL on web, the picker's local uri on mobile).
 */
export async function uploadPhoto(path: string, data: Blob): Promise<string> {
  if (mode === "mock") throw new Error("uploadPhoto() requires Firebase mode — check isMock() first");
  return uploadPhotoToFirebase(path, data);
}

export async function deletePhotoByUrl(url: string): Promise<void> {
  if (mode === "mock") return;
  return deletePhotoByUrlFromFirebase(url);
}
