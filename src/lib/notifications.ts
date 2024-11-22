import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Post } from '../types';

export async function createNotification(userId: string, data: {
  type: 'reaction' | 'comment' | 'mention';
  content: string;
  link: string;
  data?: Record<string, any>;
}) {
  try {
    await addDoc(collection(db, 'notifications'), {
      user_id: userId,
      type: data.type,
      content: data.content,
      link: data.link,
      read: false,
      created_at: serverTimestamp(),
      data: data.data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function createReactionNotification(
  post: Post,
  reactionType: string,
  reactorName: string
) {
  if (post.user_id === post.user_id) return; // Don't notify for self-reactions

  await createNotification(post.user_id, {
    type: 'reaction',
    content: `${reactorName} reacted with ${reactionType} to your post "${post.title}"`,
    link: `/communities/${post.community_id}`,
    data: {
      post_id: post.id,
      reaction_type: reactionType
    }
  });
}