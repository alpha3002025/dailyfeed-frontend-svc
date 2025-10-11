/**
 * Environment configuration for API endpoints
 *
 * IMPORTANT: All backend API calls now go through the Next.js API proxy at /api/proxy/*
 * This approach:
 * - Resolves environment variables at runtime (not build time)
 * - Eliminates CORS issues
 * - Allows single Docker image to work across all environments
 * - Improves security by not exposing backend URLs to clients
 *
 * Client-side code should use these proxy URLs instead of direct backend URLs
 */

// API Proxy base URL - all API calls go through this proxy
const API_PROXY_BASE = '/api/proxy';

export const config = {
  services: {
    // All services now use the API proxy
    // The proxy will route to the correct backend service based on the path
    member: API_PROXY_BASE,
    content: API_PROXY_BASE,
    timeline: API_PROXY_BASE,
    activity: API_PROXY_BASE,
    image: API_PROXY_BASE,
    search: API_PROXY_BASE,
  },
} as const;

// Helper functions to get service URLs
export const getServiceUrl = (service: keyof typeof config.services): string => {
  return config.services[service];
};

// Export individual service URLs for convenience
// These now point to the API proxy instead of direct backend URLs
export const MEMBER_SERVICE_URL = config.services.member;
export const CONTENT_SERVICE_URL = config.services.content;
export const TIMELINE_SERVICE_URL = config.services.timeline;
export const ACTIVITY_SERVICE_URL = config.services.activity;
export const IMAGE_SERVICE_URL = config.services.image;
export const SEARCH_SERVICE_URL = config.services.search;
