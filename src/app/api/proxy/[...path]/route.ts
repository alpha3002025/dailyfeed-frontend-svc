import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route
 *
 * This route handles all API requests from the client and proxies them to the backend services.
 * This approach solves the NEXT_PUBLIC_ environment variable limitation where values are
 * hardcoded at build time.
 *
 * Benefits:
 * - Runtime environment variable resolution (works with K8s ConfigMaps)
 * - No CORS issues (requests go through same origin)
 * - Single Docker image works across all environments
 * - Better security (backend URLs not exposed to client)
 */

// Service mapping configuration
const SERVICE_MAP: Record<string, string> = {
  'member': process.env.MEMBER_SERVICE_URL || 'http://localhost:8084',
  'content': process.env.CONTENT_SERVICE_URL || 'http://localhost:8081',
  'timeline': process.env.TIMELINE_SERVICE_URL || 'http://localhost:8082',
  'activity': process.env.ACTIVITY_SERVICE_URL || 'http://localhost:8086',
  'image': process.env.IMAGE_SERVICE_URL || 'http://localhost:8085',
  'search': process.env.SEARCH_SERVICE_URL || 'http://localhost:8083',
};

/**
 * Determine which backend service to use based on the API path
 */
function getServiceUrl(path: string): string | null {
  // Authentication endpoints -> member service
  if (path.startsWith('authentication/')) {
    return SERVICE_MAP.member;
  }

  // Member-related endpoints -> member service
  if (path.startsWith('members/')) {
    return SERVICE_MAP.member;
  }

  // Post and comment write operations -> content service
  if (path.startsWith('posts') || path.startsWith('comments')) {
    return SERVICE_MAP.content;
  }

  // Timeline/feed endpoints -> timeline service
  if (path.startsWith('timeline/')) {
    return SERVICE_MAP.timeline;
  }

  // Activity endpoints -> activity service
  if (path.startsWith('activity/')) {
    return SERVICE_MAP.activity;
  }

  // Image endpoints -> image service
  if (path.startsWith('images/')) {
    return SERVICE_MAP.image;
  }

  // Search endpoints -> search service
  if (path.startsWith('search/')) {
    return SERVICE_MAP.search;
  }

  return null;
}

/**
 * Proxy handler for all HTTP methods
 */
async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const { path: pathSegments } = await context.params;
    const apiPath = pathSegments.join('/');

    // Get the appropriate backend service URL
    const serviceUrl = getServiceUrl(apiPath);

    if (!serviceUrl) {
      console.error(`No service mapping found for path: ${apiPath}`);
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Construct the full backend URL
    const backendUrl = `${serviceUrl}/api/${apiPath}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;

    console.log(`[API Proxy] ${request.method} ${fullUrl}`);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward other important headers
    const forwardHeaders = ['Content-Type', 'Accept', 'User-Agent'];
    forwardHeaders.forEach(headerName => {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    });

    // Prepare request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('Content-Type') || '';

      // Handle multipart/form-data (for file uploads)
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        requestOptions.body = formData as any;
        // Remove Content-Type header to let fetch set it with boundary
        delete headers['Content-Type'];
      } else {
        // Handle JSON body
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      }
    }

    // Make the proxied request
    const response = await fetch(fullUrl, requestOptions);

    // Handle image/binary responses
    const responseContentType = response.headers.get('Content-Type') || '';
    if (responseContentType.includes('image/') ||
        responseContentType.includes('application/octet-stream')) {
      const blob = await response.blob();

      // Apply aggressive caching for images
      // public: can be cached by any cache (browser, CDN, etc.)
      // max-age=86400: browser cache for 24 hours
      // s-maxage=604800: CDN/shared cache for 7 days
      // stale-while-revalidate=2592000: serve stale content for 30 days while revalidating
      const cacheControl = response.headers.get('Cache-Control') ||
        'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000, immutable';

      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType,
          'Cache-Control': cacheControl,
        },
      });
    }

    // Handle JSON responses
    let responseData;
    const responseText = await response.text();

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = { data: responseText };
    }

    // Forward response with all important headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward specific headers from backend
    const headersToForward = ['Authorization', 'Set-Cookie', 'Cache-Control'];
    headersToForward.forEach(headerName => {
      const value = response.headers.get(headerName);
      if (value) {
        responseHeaders[headerName] = value;
      }
    });

    console.log(`[API Proxy] Response status: ${response.status}`);

    return NextResponse.json(responseData, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}
