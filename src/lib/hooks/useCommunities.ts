import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import type { Community } from '../types';

export function useCommunities() {
  const queryClient = useQueryClient();

  const communitiesQuery = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'communities'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (communityData: Partial<Community>) => {
      const docRef = await addDoc(collection(db, 'communities'), {
        ...communityData,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...communityData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community created successfully');
    },
    onError: (error) => {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    },
  });

  const updateCommunityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Community> }) => {
      const communityRef = doc(db, 'communities', id);
      await updateDoc(communityRef, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community updated successfully');
    },
    onError: (error) => {
      console.error('Error updating community:', error);
      toast.error('Failed to update community');
    },
  });

  return {
    communities: communitiesQuery.data || [],
    isLoading: communitiesQuery.isLoading,
    error: communitiesQuery.error,
    createCommunity: createCommunityMutation.mutate,
    updateCommunity: updateCommunityMutation.mutate,
  };
}