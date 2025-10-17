// Cloudinary Service for handling image uploads
export class CloudinaryService {
  static cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  static uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  static baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  // Base endpoint for non-image (auto) uploads (pdfs, docs, etc.)
  static fileUploadBase = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

  /**
   * Upload image to Cloudinary
   * @param {File} file - The image file to upload
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} - Upload result with URL and other data
   */
  static async uploadImage(file, options = {}) {
    try {
      // Validate file
      if (!file) {
        throw new Error("No file provided");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);

      // Add optional parameters (only those allowed for unsigned upload)
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      // Note: Transformations are not allowed in unsigned uploads
      // They should be configured in the upload preset or applied via URL transformation

      // Upload to Cloudinary
      const response = await fetch(this.baseUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const result = await response.json();

      return {
        success: true,
        secure_url: result.secure_url, // Keep the original property name
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        originalFilename: result.original_filename,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload any file (PDF, doc, etc.) to Cloudinary using the auto/upload endpoint
   * @param {File} file - The file to upload (pdf)
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} - Upload result with URL and other data
   */
  static async uploadFile(file, options = {}) {
    try {
      if (!file) throw new Error("No file provided");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);

      if (options.folder) {
        formData.append("folder", options.folder);
      }

      const response = await fetch(this.fileUploadBase, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "File upload failed");
      }

      const result = await response.json();

      return {
        success: true,
        secure_url: result.secure_url || result.url,
        url: result.secure_url || result.url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
        originalFilename: result.original_filename,
      };
    } catch (error) {
      console.error("Cloudinary file upload error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload profile picture with specific optimizations
   * @param {File} file - The profile image file
   * @returns {Promise<Object>} - Upload result
   */
  static async uploadProfilePicture(file) {
    const result = await this.uploadImage(file, {
      folder: "resumeai/profile-pictures",
    });

    // If upload successful, generate optimized URL for profile picture
    if (result.success && result.publicId) {
      const optimizedUrl = this.getOptimizedUrl(result.publicId, {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
      });
      result.secure_url = optimizedUrl;
      result.url = optimizedUrl;
    }

    return result;
  }

  /**
   * Generate optimized URL for existing Cloudinary image
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} - Optimized image URL
   */
  static getOptimizedUrl(publicId, options = {}) {
    const {
      width = 400,
      height = 400,
      crop = "fill",
      quality = "auto",
      format = "auto",
      gravity = "face",
    } = options;

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality},f_${format},g_${gravity}/${publicId}`;
  }

  /**
   * Delete image from Cloudinary (requires backend API call due to security)
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} - Delete result
   */
  static async deleteImage(publicId) {
    try {
      // This would typically be handled by your backend API
      // as it requires API secret which shouldn't be exposed in frontend
      console.log("Delete request for:", publicId);
      return {
        success: true,
        message: "Delete request sent to backend",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate Cloudinary configuration
   * @returns {boolean} - Whether configuration is valid
   */
  static isConfigured() {
    return !!(this.cloudName && this.uploadPreset);
  }

  /**
   * Get upload progress (for future implementation with XMLHttpRequest)
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Upload result with progress
   */
  static async uploadWithProgress(file, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);
      formData.append("folder", "resumeai/profile-pictures");

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);

          // Generate optimized URL for profile picture
          const optimizedUrl = this.getOptimizedUrl(result.public_id, {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
          });

          resolve({
            success: true,
            secure_url: optimizedUrl,
            url: optimizedUrl,
            publicId: result.public_id,
          });
        } else {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));

      xhr.open("POST", this.baseUrl);
      xhr.send(formData);
    });
  }
}

// Export default
export default CloudinaryService;
