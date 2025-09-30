// src/utils/apiConfig.ts

/**
 * Retrieves the API URL from environment variables with a fallback for local development.
 * This ensures a single source of truth for the backend URL.
 */
const getApiUrl = (): string => {
  // Use VITE_API_URL if provided (for local dev), otherwise use relative path for production
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // Remove any trailing slashes to prevent URL construction issues
  return apiUrl.replace(/\/+$/, '');
};

export const API_URL = getApiUrl();