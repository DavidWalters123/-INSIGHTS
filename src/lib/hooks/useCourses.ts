import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import type { Course } from '../types';

export function useCourses() {
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      if (!auth.currentUser) throw new Error('Must be logged in');

      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp(),
        status: 'draft'
      });

      return { id: docRef.id, ...courseData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error) => {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, {
        ...data,
        updated_at: serverTimestamp()
      });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    },
  });

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
  };
}