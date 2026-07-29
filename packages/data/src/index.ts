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

export async function uploadPhoto(path: string, data: Blob): Promise<string> {
  if (mode === "mock") throw new Error("uploadPhoto() requires Firebase mode — check isMock() first");
  return uploadPhotoToFirebase(path, data);
}

export async function deletePhotoByUrl(url: string): Promise<void> {
  if (mode === "mock") return;
  return deletePhotoByUrlFromFirebase(url);
}
