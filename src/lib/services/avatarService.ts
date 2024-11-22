import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

export async function uploadAvatar(userId: string, file: Blob): Promise<string> {
  try {
    // First, delete any existing avatars for this user
    const avatarsRef = ref(storage, 'avatars');
    const avatarsList = await listAll(avatarsRef);
    const userAvatars = avatarsList.items.filter(item => 
      item.name.startsWith(userId)
    );
    
    await Promise.all(
      userAvatars.map(avatar => deleteObject(avatar))
    );

    // Create new avatar reference
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.jpg`;
    const avatarRef = ref(storage, `avatars/${fileName}`);

    // Upload the new avatar
    await uploadBytes(avatarRef, file, {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    });
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(avatarRef);

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatar_url: downloadUrl,
      updated_at: new Date()
    });

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

export async function deleteAvatar(userId: string): Promise<void> {
  try {
    // Delete all avatars for this user
    const avatarsRef = ref(storage, 'avatars');
    const avatarsList = await listAll(avatarsRef);
    const userAvatars = avatarsList.items.filter(item => 
      item.name.startsWith(userId)
    );
    
    await Promise.all([
      // Delete all avatar files
      ...userAvatars.map(avatar => deleteObject(avatar)),
      // Update user document
      updateDoc(doc(db, 'users', userId), {
        avatar_url: null,
        updated_at: new Date()
      })
    ]);
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}