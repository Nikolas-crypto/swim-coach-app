import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const resolvedConfig = {
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env?.VITE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
};

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test server connection as mandated
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'seasons', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or connecting...");
    }
  }
}

// Seamless authentication: tries anonymous session if enabled on Firebase, 
// or cleanly falls back to passcode-gate mode if Anonymous Auth is disabled in Firebase console.
export function initAuth(onUserChange?: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (onUserChange) onUserChange(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        if (onUserChange) onUserChange(cred.user);
      } catch (err: unknown) {
        const errorObj = err as { code?: string; message?: string };
        // If Anonymous Auth is not enabled in Firebase Console (auth/admin-restricted-operation),
        // we cleanly operate in passcode-gated mode without throwing or logging console errors.
        if (
          errorObj?.code === 'auth/admin-restricted-operation' ||
          errorObj?.message?.includes('admin-restricted-operation') ||
          errorObj?.code === 'auth/operation-not-allowed'
        ) {
          if (onUserChange) onUserChange(null);
        } else {
          console.warn('Firebase auth notice:', errorObj?.message || errorObj);
          if (onUserChange) onUserChange(null);
        }
      }
    }
  });
}

