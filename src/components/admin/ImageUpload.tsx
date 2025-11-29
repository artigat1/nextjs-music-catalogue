"use client";

import React, { useState } from "react";
import { ImageUploadZone } from "./ImageUploadZone";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { UploadProgressBar } from "./UploadProgressBar";
import { UploadProgress } from "@/types/storage";
import {
  uploadImage,
  deleteImage,
  validateImageFile,
} from "@/firebase/storage";

interface ImageUploadProps {
  mode: "single" | "multiple";
  currentImages: string[];
  onImagesChange: (urls: string[]) => void;
  recordingId: string;
  storagePath: "main" | "gallery";
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  mode,
  currentImages,
  onImagesChange,
  recordingId,
  storagePath,
  maxFiles = 20,
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);

    // Validate file count for single mode
    if (mode === "single" && files.length > 1) {
      setError("Only one image can be uploaded");
      return;
    }

    // Validate total file count for multiple mode
    if (mode === "multiple" && currentImages.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join("; "));
      if (validFiles.length === 0) return;
    }

    // Create initial upload progress entries
    const newUploads: UploadProgress[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading",
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Upload files
    const uploadPromises = validFiles.map((file) => {
      return uploadImage(file, recordingId, storagePath, (progress) => {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.file === file ? { ...upload, progress } : upload
          )
        );
      })
        .then((url) => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.file === file
                ? { ...upload, status: "success", url, progress: 100 }
                : upload
            )
          );
          return url;
        })
        .catch((error) => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.file === file
                ? {
                    ...upload,
                    status: "error",
                    error: error.message || "Upload failed",
                    progress: 0,
                  }
                : upload
            )
          );
          return null;
        });
    });

    const urls = await Promise.all(uploadPromises);
    const successfulUrls = urls.filter((url): url is string => url !== null);

    if (successfulUrls.length > 0) {
      if (mode === "single") {
        onImagesChange([successfulUrls[0]]);
      } else {
        onImagesChange([...currentImages, ...successfulUrls]);
      }
    }

    // Clear completed/errored uploads after a delay
    setTimeout(() => {
      setUploads((prev) =>
        prev.filter((upload) => upload.status === "uploading")
      );
    }, 3000);
  };

  const handleDelete = async (url: string) => {
    try {
      await deleteImage(url);
      onImagesChange(currentImages.filter((img) => img !== url));
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  const isUploading = uploads.some((upload) => upload.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload Zone */}
      {(mode === "multiple" || currentImages.length === 0) && (
        <ImageUploadZone
          onFilesSelected={handleFilesSelected}
          multiple={mode === "multiple"}
          disabled={isUploading}
        />
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <UploadProgressBar key={`${upload.file.name}-${index}`} upload={upload} />
          ))}
        </div>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === "single" ? "Current Image" : `Current Images (${currentImages.length})`}
            </label>
            {mode === "multiple" && (
              <span className="text-xs text-gray-500">
                {currentImages.length} / {maxFiles}
              </span>
            )}
          </div>
          <ImagePreviewGrid
            images={currentImages}
            onDelete={handleDelete}
            disabled={isUploading}
          />
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {mode === "single"
          ? "Upload a single image for this recording"
          : `Upload up to ${maxFiles} images for the gallery`}
      </p>
    </div>
  );
};
