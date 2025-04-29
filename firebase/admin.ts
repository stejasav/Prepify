import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initFirebaseAdmin() {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
    return {
      auth: getAuth(),
      db: getFirestore(),
    };
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error;
  }
}

export const { auth: adminAuth, db: adminDb } = initFirebaseAdmin();
