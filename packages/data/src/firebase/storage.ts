import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "./app";

export async function uploadPhoto(path: string, data: Blob): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, data);
  return getDownloadURL(storageRef);
}

/**
 * Best-effort delete: task/completion photos can still hold pre-upload data
 * (placeholder paths, arbitrary pasted URLs) that aren't real Storage objects,
 * so a delete failure here is expected sometimes and shouldn't break the
 * caller's flow (e.g. releasing payment).
 */
export async function deletePhotoByUrl(url: string): Promise<void> {
  if (!url.includes("firebasestorage.googleapis.com") && !url.startsWith("gs://")) return;
  try {
    await deleteObject(ref(getFirebaseStorage(), url));
  } catch {
    // Already gone, or not a real Storage object — nothing more to do.
  }
}
