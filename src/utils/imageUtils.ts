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
 * Check if a URL is a blob URL
 * @param url The URL to check
 * @returns boolean True if it's a blob URL
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Convert image URI to a persistent format
 * @param uri The image URI
 * @returns Promise<string> Persistent image URI
 */
export const makeImagePersistent = async (uri: string): Promise<string> => {
  if (!uri) return '';
  
  // If it's not a blob URL, return as is
  if (!isBlobUrl(uri)) {
    return uri;
  }
  
  // Convert blob URL to base64
  try {
    return await blobUrlToBase64(uri);
  } catch (error) {
    console.error('Failed to make image persistent:', error);
    return '';
  }
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
