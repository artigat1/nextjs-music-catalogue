import React from "react";
import { UploadProgress } from "@/types/storage";

interface UploadProgressBarProps {
  upload: UploadProgress;
  onCancel?: () => void;
}

export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  upload,
  onCancel,
}) => {
  const getStatusIcon = () => {
    switch (upload.status) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const truncateFilename = (filename: string, maxLength: number = 30) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split(".").pop();
    const nameWithoutExt = filename.slice(0, filename.lastIndexOf("."));
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension!.length - 4);
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700 truncate">
            {truncateFilename(upload.file.name)}
          </span>
        </div>
        {upload.status === "uploading" && onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="Cancel upload"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {upload.status === "uploading" && (
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {Math.round(upload.progress)}%
          </div>
        </div>
      )}

      {upload.status === "error" && upload.error && (
        <p className="text-xs text-red-500 mt-1">{upload.error}</p>
      )}
    </div>
  );
};
