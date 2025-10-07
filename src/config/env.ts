/**
 * Environment configuration for backend services
 * This file centralizes all backend service URLs for easy management
 */

export const config = {
  services: {
    member: process.env.NEXT_PUBLIC_MEMBER_SERVICE_URL || 'http://localhost:8084',
    content: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:8081',
    timeline: process.env.NEXT_PUBLIC_TIMELINE_SERVICE_URL || 'http://localhost:8082',
    activity: process.env.NEXT_PUBLIC_ACTIVITY_SERVICE_URL || 'http://localhost:8086',
    image: process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:8085',
    search: process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL || 'http://localhost:8083',
  },
} as const;

// Helper functions to get service URLs
export const getServiceUrl = (service: keyof typeof config.services): string => {
  return config.services[service];
};

// Export individual service URLs for convenience
export const MEMBER_SERVICE_URL = config.services.member;
export const CONTENT_SERVICE_URL = config.services.content;
export const TIMELINE_SERVICE_URL = config.services.timeline;
export const ACTIVITY_SERVICE_URL = config.services.activity;
export const IMAGE_SERVICE_URL = config.services.image;
export const SEARCH_SERVICE_URL = config.services.search;
