import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Generate a unique filename using timestamp and random string
 */
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload a single image to Firebase Storage
 */
export const uploadImage = (
  file: File,
  recordingId: string,
  storagePath: "main" | "gallery",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filename = generateUniqueFilename(file.name);
    const path = `recordings/${recordingId}/${storagePath}/${filename}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

/**
 * Upload multiple images to Firebase Storage
 */
export const uploadMultipleImages = async (
  files: File[],
  recordingId: string,
  storagePath: "main" | "gallery",
  onProgress?: (fileIndex: number, progress: number) => void,
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    return uploadImage(file, recordingId, storagePath, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * Check if a URL is a Firebase Storage URL
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === "firebasestorage.googleapis.com";
  } catch {
    return false;
  }
};

/**
 * Delete an image from Firebase Storage using its URL
 * Only deletes if the URL is from Firebase Storage
 * For external URLs, this function does nothing (just removes from state)
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Only attempt to delete if it's a Firebase Storage URL
  if (!isFirebaseStorageUrl(imageUrl)) {
    // External URL - just remove from state, don't try to delete from storage
    return;
  }

  try {
    // Extract the storage path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new Error("Invalid Firebase Storage URL");
    }

    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image from Firebase Storage:", error);
    throw error;
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
};
