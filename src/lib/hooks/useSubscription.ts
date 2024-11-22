import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import type { Subscription } from '../types';

export function useSubscription(productId?: string) {
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', productId],
    queryFn: async () => {
      if (!auth.currentUser || !productId) return null;

      const q = query(
        collection(db, 'subscriptions'),
        where('user_id', '==', auth.currentUser.uid),
        where('product_id', '==', productId)
      );

      const snapshot = await getDocs(q);
      return snapshot.empty ? null : {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as Subscription;
    },
    enabled: !!auth.currentUser && !!productId,
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subscriptionRef, {
        cancel_at_period_end: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription will be canceled at the end of the billing period');
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    },
  });

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    cancelSubscription: cancelSubscriptionMutation.mutate,
  };
}