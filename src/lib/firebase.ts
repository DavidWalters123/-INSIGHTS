import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentSingleTabManager,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence,
  serverTimestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  runTransaction,
  FirestoreError
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { toast } from 'react-hot-toast';

const firebaseConfig = {
  apiKey: "AIzaSyDRhGmTb6KWlAomFKmjDLRoalWQAQLwlDQ",
  authDomain: "insights-61c4a.firebaseapp.com",
  projectId: "insights-61c4a",
  storageBucket: "insights-61c4a.appspot.com",
  messagingSenderId: "1022279389566",
  appId: "1:1022279389566:web:3a23123de3480dd586e32f",
  measurementId: "G-H4EWQ6P96W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore with persistent cache and unlimited cache size
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (err) {
  console.warn('Error enabling persistence:', err);
}

// Helper function to handle Firestore errors with improved error messages
export function handleFirestoreError(error: unknown, fallbackMessage = 'An error occurred'): null {
  const firestoreError = error as FirestoreError;
  
  // Only log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Firestore error:', firestoreError);
  }

  let message = fallbackMessage;
  let duration = 5000; // Default toast duration

  if (firestoreError.code) {
    switch (firestoreError.code) {
      case 'failed-precondition':
        message = 'Please refresh the page and try again. Some data may be out of sync.';
        break;
      case 'permission-denied':
        message = 'You don\'t have permission to perform this action. Please check your access rights.';
        break;
      case 'not-found':
        message = 'The requested resource was not found. It may have been deleted or moved.';
        break;
      case 'cancelled':
        message = 'Operation was cancelled. Please try again.';
        break;
      case 'unknown':
        message = 'An unexpected error occurred. Please try again or contact support if the issue persists.';
        duration = 7000;
        break;
      case 'invalid-argument':
        message = 'Invalid data provided. Please check your input and try again.';
        break;
      case 'deadline-exceeded':
        message = 'The operation timed out. Please check your connection and try again.';
        break;
      case 'already-exists':
        message = 'This resource already exists. Please try a different name or identifier.';
        break;
      case 'resource-exhausted':
        message = 'Too many requests. Please wait a moment and try again.';
        duration = 7000;
        break;
      case 'data-loss':
        message = 'Critical error: Data loss occurred. Please contact support.';
        duration = 10000;
        break;
      case 'unauthenticated':
        message = 'Your session has expired. Please sign in again to continue.';
        break;
      case 'unavailable':
        message = 'Service temporarily unavailable. Please try again in a few moments.';
        break;
      case 'aborted':
        message = 'Operation was aborted. Please try again.';
        break;
      case 'out-of-range':
        message = 'Operation was attempted past the valid range.';
        break;
      default:
        message = fallbackMessage;
    }
  }

  toast.error(message, { duration });
  return null;
}

export {
  serverTimestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  runTransaction
};