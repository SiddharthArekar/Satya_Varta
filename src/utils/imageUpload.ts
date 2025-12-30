import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, auth, db } from '@/firebaseConfig';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Compress image before upload
const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 400x400)
      const maxSize = 400;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }
  
  return { valid: true };
};

// Upload profile picture
export const uploadProfilePicture = async (file: File): Promise<ImageUploadResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Compress image
    const compressedFile = await compressImage(file);

    // Create storage reference
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update Firebase Auth profile
    await updateProfile(user, {
      photoURL: downloadURL
    });

    // Update Firestore document
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      photoURL: downloadURL,
      updatedAt: new Date()
    });

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
};

// Delete profile picture and revert to Google photo
export const deleteProfilePicture = async (): Promise<ImageUploadResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get original Google photo URL from provider data
    const googlePhotoURL = user.providerData.find(
      provider => provider.providerId === 'google.com'
    )?.photoURL || null;

    // Delete from storage if exists
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await deleteObject(storageRef);
    } catch (error) {
      // File might not exist, continue anyway
      console.log('No custom profile picture to delete');
    }

    // Update Firebase Auth profile
    await updateProfile(user, {
      photoURL: googlePhotoURL
    });

    // Update Firestore document
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      photoURL: googlePhotoURL,
      updatedAt: new Date()
    });

    return { success: true, url: googlePhotoURL || undefined };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete image' 
    };
  }
};
