const trimTrailingSlash = (value) => value?.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL) || '/api';
