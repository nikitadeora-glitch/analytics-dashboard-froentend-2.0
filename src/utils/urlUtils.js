/**
 * Formats a URL to show only the main part (before ? or #)
 * @param {string} url - The full URL to format
 * @returns {string} Formatted URL
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  try {
    // If it's a relative URL, just return as is
    if (!url.startsWith('http')) return url;
    
    const urlObj = new URL(url);
    // Return protocol + hostname + pathname
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch (e) {
    // If URL parsing fails, try to clean it up
    return url.split('?')[0].split('#')[0];
  }
};

/**
 * Checks if a URL is valid
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (e) {
    return false;
  }
};
