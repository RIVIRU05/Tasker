import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
// @ts-expect-error -- getReactNativePersistence exists at runtime but isn't in this SDK version's public types
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configure } from "@taskhub/data";

const useMock = process.env.EXPO_PUBLIC_USE_MOCK !== "false";

if (useMock) {
  configure({ useMock: true });
} else {
  const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  const authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  configure({ useMock: false, firebaseConfig, authInstance, forceLongPolling: true });
}
