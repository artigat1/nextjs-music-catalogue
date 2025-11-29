import React, { useState } from "react";
import Image from "next/image";

interface ImagePreviewGridProps {
  images: string[];
  onDelete: (url: string) => void;
  disabled?: boolean;
}

export const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
  images,
  onDelete,
  disabled = false,
}) => {
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const handleDelete = async (url: string) => {
    if (disabled || deletingUrl) return;

    setDeletingUrl(url);
    try {
      await onDelete(url);
    } finally {
      setDeletingUrl(null);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {images.map((url) => (
        <div
          key={url}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
        >
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />

          {/* Overlay with delete button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={() => handleDelete(url)}
              disabled={disabled || deletingUrl === url}
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                bg-red-500 hover:bg-red-600 text-white rounded-full p-2
                ${disabled || deletingUrl === url ? "cursor-not-allowed opacity-50" : ""}
              `}
              aria-label="Delete image"
            >
              {deletingUrl === url ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Loading state overlay */}
          {deletingUrl === url && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-sm text-gray-600">Deleting...</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
