/**
 * Image utility functions for handling blob URLs and image conversion
 */

/**
 * Convert a blob URL to base64 string
 * @param blobUrl The blob URL to convert
 * @returns Promise<string> Base64 string
 */
export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix if needed
        const base64 = result.includes('base64,') 
          ? result.split('base64,')[1] 
          : result;
        resolve(`data:image/jpeg;base64,${base64}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    throw error;
  }
};

/**
 * Convert a local file URI to base64 string
 * @param fileUri The local file URI to convert
 * @returns Promise<string> Base64 string
 */
export const fileUriToBase64 = async (fileUri: string): Promise<string> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix if needed
        const base64 = result.includes('base64,') 
          ? result.split('base64,')[1] 
          : result;
        resolve(`data:image/jpeg;base64,${base64}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file URI to base64:', error);
    throw error;
  }
};

/**
 * Check if a URL is a blob URL
 * @param url The URL to check
 * @returns boolean True if it's a blob URL
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Check if a URL is a local file URI
 * @param url The URL to check
 * @returns boolean True if it's a local file URI
 */
export const isFileUri = (url: string): boolean => {
  return url.startsWith('file://');
};

/**
 * Convert image URI to a persistent format
 * @param uri The image URI
 * @returns Promise<string> Persistent image URI
 */
export const makeImagePersistent = async (uri: string): Promise<string> => {
  if (!uri) return '';
  
  // If it's a blob URL, convert to base64
  if (isBlobUrl(uri)) {
    try {
      return await blobUrlToBase64(uri);
    } catch (error) {
      console.error('Failed to convert blob URL:', error);
      return '';
    }
  }
  
  // If it's a local file URI, convert to base64
  if (isFileUri(uri)) {
    try {
      console.log('Converting local file URI to base64...');
      return await fileUriToBase64(uri);
    } catch (error) {
      console.error('Failed to convert file URI:', error);
      return '';
    }
  }
  
  // If it's already a remote URL or base64, return as is
  return uri;
};

/**
 * Validate if an image URI is accessible
 * @param uri The image URI to validate
 * @returns Promise<boolean> True if accessible
 */
export const validateImageUri = async (uri: string): Promise<boolean> => {
  if (!uri) return false;
  
  try {
    const response = await fetch(uri, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Image URI validation failed:', error);
    return false;
  }
};
