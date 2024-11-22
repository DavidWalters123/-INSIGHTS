import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { toast } from 'react-hot-toast';
import { auth } from '../firebase';

interface UploadOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  quality?: number;
  folder: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  quality: 0.8,
  folder: 'images'
};

async function compressImage(file: File | Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

export async function uploadImage(
  file: File | Blob,
  options: Partial<UploadOptions> = {}
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to upload images');
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Validate file size
    if (file.size > opts.maxSizeInMB! * 1024 * 1024) {
      throw new Error(`File size must be less than ${opts.maxSizeInMB}MB`);
    }

    // Validate file type if it's a File object
    if (file instanceof File && opts.allowedTypes?.length) {
      if (!opts.allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed types: ' + opts.allowedTypes.join(', '));
      }
    }

    // Compress image if it's a blob/file
    let compressedFile = file;
    if (opts.quality && opts.quality < 1) {
      compressedFile = await compressImage(file, opts.quality);
    }

    // Create storage reference with user ID and timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}.jpg`;
    const storageRef = ref(storage, `${opts.folder}/${auth.currentUser.uid}/${fileName}`);

    // Upload file with metadata
    const snapshot = await uploadBytes(storageRef, compressedFile, {
      contentType: 'image/jpeg',
      customMetadata: {
        uploadedBy: auth.currentUser.uid,
        originalName: file instanceof File ? file.name : 'image.jpg'
      }
    });

    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check if you\'re signed in.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was cancelled');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please try again.');
    }
    throw error;
  }
}

export async function deleteImage(url: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to delete images');
  }

  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}