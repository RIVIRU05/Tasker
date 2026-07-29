import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "./app";

export async function uploadPhoto(path: string, data: Blob): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, data);
  return getDownloadURL(storageRef);
}

// Best-effort: legacy photo fields can hold non-Storage URLs, so failures here must not break the caller.
export async function deletePhotoByUrl(url: string): Promise<void> {
  if (!url.includes("firebasestorage.googleapis.com") && !url.startsWith("gs://")) return;
  try {
    await deleteObject(ref(getFirebaseStorage(), url));
  } catch {}
}
