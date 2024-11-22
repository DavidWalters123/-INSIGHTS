import { useEffect, useState, useCallback, useRef } from 'react';
import { Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { handleFirestoreError } from '../firebase';

interface UseFirestoreQueryOptions<T> {
  onError?: (error: Error) => void;
  transform?: (doc: DocumentData) => T;
  onSuccess?: (data: T[]) => void;
}

export function useFirestoreQuery<T>(query: Query, options: UseFirestoreQueryOptions<T> = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const active = useRef(true);

  const { onError, transform, onSuccess } = options;

  const handleSnapshot = useCallback((snapshot: QuerySnapshot<DocumentData>) => {
    if (!active.current) return;

    try {
      const docs = snapshot.docs.map((doc) => {
        const data = { id: doc.id, ...doc.data() };
        return transform ? transform(data) : data;
      });
      setData(docs as T[]);
      setLoading(false);
      setError(null);
      onSuccess?.(docs as T[]);
    } catch (err) {
      handleFirestoreError(err, 'Error processing data');
      setError(err as Error);
      setLoading(false);
      onError?.(err as Error);
    }
  }, [transform, onSuccess, onError]);

  useEffect(() => {
    setLoading(true);
    active.current = true;
    
    try {
      // Clean up previous subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Set up new subscription
      unsubscribeRef.current = onSnapshot(
        query,
        handleSnapshot,
        (err) => {
          if (!active.current) return;
          handleFirestoreError(err, 'Failed to load data');
          setError(err);
          setLoading(false);
          onError?.(err);
        }
      );
    } catch (err) {
      handleFirestoreError(err, 'Failed to set up data subscription');
      setError(err as Error);
      setLoading(false);
      onError?.(err as Error);
    }

    // Cleanup function
    return () => {
      active.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query, handleSnapshot, onError]);

  return { data, loading, error };
}