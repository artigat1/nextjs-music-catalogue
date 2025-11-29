export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  maxSizeMB: number;
  allowedTypes: string[];
  maxFiles: number;
}

export type StoragePath = 'main' | 'gallery';
