import { useEffect, useRef } from 'react';
import { Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { handleFirestoreError } from '../firebase';

export function useFirestoreSubscription<T>(
  query: Query | null,
  onData: (data: T[]) => void,
  options: {
    onError?: (error: Error) => void;
    transform?: (doc: DocumentData) => T;
    fallbackSort?: (a: T, b: T) => number;
  } = {}
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (!query) return;

    const { onError, transform, fallbackSort } = options;

    try {
      unsubscribeRef.current = onSnapshot(
        query,
        {
          includeMetadataChanges: true,
          next: (snapshot: QuerySnapshot<DocumentData>) => {
            if (!mounted.current) return;

            try {
              let docs = snapshot.docs.map((doc) => {
                const data = { id: doc.id, ...doc.data() };
                return transform ? transform(data) : data;
              });

              if (fallbackSort) {
                docs = docs.sort(fallbackSort);
              }

              onData(docs as T[]);
            } catch (err) {
              handleFirestoreError(err, 'Error processing data');
              if (onError && mounted.current) onError(err as Error);
            }
          },
          error: (error) => {
            handleFirestoreError(error, 'Failed to load data');
            if (onError && mounted.current) onError(error);
          }
        }
      );
    } catch (err) {
      handleFirestoreError(err, 'Failed to connect to database');
      if (onError && mounted.current) onError(err as Error);
    }

    return () => {
      mounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]);
}