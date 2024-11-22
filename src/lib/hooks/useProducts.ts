import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import type { Product } from '../types';

export function useProducts(creatorId?: string) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', creatorId],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    },
    enabled: !!creatorId,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      if (!auth.currentUser) throw new Error('Must be logged in');

      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        creator_id: auth.currentUser.uid,
        created_at: serverTimestamp(),
        status: 'draft'
      });

      return { id: docRef.id, ...productData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...data,
        updated_at: serverTimestamp()
      });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
  };
}