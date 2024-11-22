import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const PAGE_SIZE = 10;

export function useInfiniteScroll<T>(
  collectionName: string,
  queryKey: string[],
  orderByField: string = 'created_at'
) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam = null }) => {
      let q = query(
        collection(db, collectionName),
        orderBy(orderByField, 'desc'),
        limit(PAGE_SIZE)
      );

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      const snapshot = await getDocs(q);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return {
        items,
        lastVisible,
      };
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data,
    error,
    isLoading: status === 'loading',
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef: ref,
  };
}