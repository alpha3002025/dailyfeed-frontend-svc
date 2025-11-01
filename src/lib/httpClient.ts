/**
 * HTTP Client with automatic token refresh
 *
 * This client automatically checks for X-Token-Refresh-Needed header
 * and refreshes the token when needed.
 */

const TOKEN_KEY = 'dailyfeed_token';

interface FetchOptions extends RequestInit {
  skipTokenRefresh?: boolean; // Flag to prevent infinite loops
}

class HttpClient {
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  /**
   * Get the current token from localStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  /**
   * Update the token in localStorage
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('🔄 Refreshing token...');
        const response = await fetch('/api/proxy/token/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies (refresh_token is httpOnly)
        });

        if (!response.ok) {
          console.error('❌ Token refresh failed:', response.status);
          return null;
        }

        // Extract new token from Authorization header
        const authHeader = response.headers.get('Authorization');
        if (!authHeader) {
          console.error('❌ No Authorization header in refresh response');
          return null;
        }

        // Remove 'Bearer ' prefix if present
        const newToken = authHeader.startsWith('Bearer ')
          ? authHeader.substring(7)
          : authHeader;

        console.log('✅ Token refreshed successfully');
        console.log('🍪 Refresh token cookie updated by server');
        this.setToken(newToken);
        return newToken;
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Enhanced fetch with automatic token refresh
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipTokenRefresh, ...fetchOptions } = options;

    // Add Authorization header if token exists
    const token = this.getToken();
    const headers: HeadersInit = {
      ...fetchOptions.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Make the request with credentials to include cookies
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies in all requests
    });

    // Check if relogin is required
    const reloginRequired = response.headers.get('X-Relogin-Required');
    if (reloginRequired === 'true') {
      console.warn('⚠️ Relogin required - clearing session and redirecting to login');

      // 1. Clear local storage and session storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // 2. Cookies will be automatically expired by the browser
        // (Refresh Token is expired, so server will reject it)

        // 3. Redirect to login page
        window.location.href = '/login';
      }

      // Return the response as-is (redirect will happen before further processing)
      return response;
    }

    // Check if token refresh is needed
    if (!skipTokenRefresh) {
      const refreshNeeded = response.headers.get('X-Token-Refresh-Needed');

      if (refreshNeeded === 'true') {
        console.log('⚠️ Token refresh needed, refreshing...');
        const newToken = await this.refreshToken();

        if (newToken) {
          // Retry the original request with the new token
          console.log('🔄 Retrying request with new token');
          const retryHeaders: HeadersInit = {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${newToken}`,
          };

          return fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
            credentials: 'include',
          });
        } else {
          console.error('❌ Failed to refresh token, returning original response');
        }
      }
    }

    return response;
  }

  /**
   * Convenience methods for common HTTP methods
   */
  async get(url: string, options?: FetchOptions): Promise<Response> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(url: string, body?: any, options?: FetchOptions): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  async put(url: string, body?: any, options?: FetchOptions): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  async delete(url: string, options?: FetchOptions): Promise<Response> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  async patch(url: string, body?: any, options?: FetchOptions): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }
}

// Export singleton instance
export const httpClient = new HttpClient();

// Export for use in other modules
export default httpClient;
