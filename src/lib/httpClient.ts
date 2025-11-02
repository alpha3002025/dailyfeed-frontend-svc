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
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch('/api/proxy/token/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          return null;
        }

        const authHeader = response.headers.get('Authorization');
        if (!authHeader) {
          return null;
        }

        const newToken = authHeader.startsWith('Bearer ')
          ? authHeader.substring(7)
          : authHeader;

        this.setToken(newToken);
        return newToken;
      } catch (error) {
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

    const reloginRequired = response.headers.get('X-Relogin-Required');
    if (reloginRequired === 'true') {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return response;
    }

    if (!skipTokenRefresh) {
      const refreshNeeded = response.headers.get('X-Token-Refresh-Needed');

      if (refreshNeeded === 'true') {
        const newToken = await this.refreshToken();

        if (newToken) {
          const retryHeaders: HeadersInit = {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${newToken}`,
          };

          return fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
            credentials: 'include',
          });
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
