import { useState } from "react";
import { CloudinaryService } from "../services/cloudinaryService";

/**
 * Custom hook for handling image uploads to Cloudinary
 */
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload image with basic functionality
   */
  const uploadImage = async (file, options = {}) => {
    if (!CloudinaryService.isConfigured()) {
      setError("Cloudinary is not properly configured");
      return null;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await CloudinaryService.uploadImage(file, options);

      if (result.success) {
        setUploadProgress(100);
        return result;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Upload image with progress tracking
   */
  const uploadImageWithProgress = async (file, onProgressUpdate = null) => {
    if (!CloudinaryService.isConfigured()) {
      setError("Cloudinary is not properly configured");
      return null;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await CloudinaryService.uploadWithProgress(
        file,
        (progress) => {
          setUploadProgress(progress);
          if (onProgressUpdate) onProgressUpdate(progress);
        }
      );

      if (result.success) {
        return result;
      } else {
        setError("Upload failed");
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Upload profile picture specifically
   */
  const uploadProfilePicture = async (file) => {
    return CloudinaryService.uploadProfilePicture(file);
  };

  /**
   * Reset error state
   */
  const clearError = () => setError(null);

  return {
    uploading,
    uploadProgress,
    error,
    uploadImage,
    uploadImageWithProgress,
    uploadProfilePicture,
    clearError,
  };
};

export default useImageUpload;
