const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string) =>
  value.startsWith('/') ? value : `/${value}`;

const dedupeApiPrefix = (baseUrl: string, endpoint: string) => {
  if (baseUrl.endsWith('/api')) {
    return endpoint.replace(/^\/api(\/|$)/, '/');
  }
  return endpoint;
};

const resolveRawBaseUrl = () => {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
  return env.VITE_API_URL || env.VITE_BACKEND_URL || 'http://localhost:8000';
};

export const getApiBaseUrl = () => {
  const rawBaseUrl = resolveRawBaseUrl();
  return trimTrailingSlashes(rawBaseUrl);
};

export const buildApiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = ensureLeadingSlash(endpoint.trim());
  const dedupedEndpoint = dedupeApiPrefix(baseUrl, normalizedEndpoint);

  if (!dedupedEndpoint || dedupedEndpoint === '/') {
    return baseUrl;
  }

  return `${baseUrl}${dedupedEndpoint}`;
};
