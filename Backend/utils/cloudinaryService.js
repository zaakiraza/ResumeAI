import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Backend Cloudinary Service for uploading PDFs
 * This uses unsigned uploads via Cloudinary's upload API
 */
export class CloudinaryService {
  static cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  static uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  
  /**
   * Upload PDF buffer to Cloudinary
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {Object} options - Upload options (folder, filename)
   * @returns {Promise<Object>} - Upload result with secure_url
   */
  static async uploadPDF(pdfBuffer, options = {}) {
    try {
      if (!this.cloudName || !this.uploadPreset) {
        throw new Error('Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET');
      }

      const { folder = 'resumeai/pdfs', filename = 'resume' } = options;

      // Create form data boundary
      const boundary = `----WebKitFormBoundary${Date.now()}`;
      
      // Build multipart form data
      const formDataParts = [];
      
      // Add file
      formDataParts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${filename}.pdf"\r\n` +
        `Content-Type: application/pdf\r\n\r\n`
      );
      formDataParts.push(pdfBuffer);
      formDataParts.push('\r\n');
      
      // Add upload_preset
      formDataParts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="upload_preset"\r\n\r\n` +
        `${this.uploadPreset}\r\n`
      );
      
      // Add folder
      formDataParts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="folder"\r\n\r\n` +
        `${folder}\r\n`
      );
      
      // Add resource_type for auto detection
      formDataParts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="resource_type"\r\n\r\n` +
        `auto\r\n`
      );
      
      // Close boundary
      formDataParts.push(`--${boundary}--\r\n`);
      
      // Combine parts
      const formData = Buffer.concat([
        ...formDataParts.map(part => 
          Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf8')
        )
      ]);

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;
      
      const result = await this.makeRequest(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': formData.length
        },
        body: formData
      });

      return {
        success: true,
        secure_url: result.secure_url,
        url: result.url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at
      };
      
    } catch (error) {
      console.error('Cloudinary PDF upload error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Make HTTP/HTTPS request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  static makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = protocol.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else {
              reject(new Error(jsonData.error?.message || `HTTP ${res.statusCode}: ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Check if Cloudinary is configured
   * @returns {boolean}
   */
  static isConfigured() {
    return !!(this.cloudName && this.uploadPreset);
  }
}

export default CloudinaryService;
