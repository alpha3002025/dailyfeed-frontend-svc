const API_BASE_URL = 'http://localhost:8084';
const TOKEN_KEY = 'dailyfeed_token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  memberName: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/authentication/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      // Get response body
      const responseData = await response.json();
      console.log('Login response:', responseData);

      // Try to extract JWT token from various possible locations
      let token = null;

      // 1. Check response headers
      const authHeader = response.headers.get('Authorization') ||
                        response.headers.get('authorization') ||
                        response.headers.get('x-auth-token') ||
                        response.headers.get('X-Auth-Token');

      if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        console.log('Token found in headers:', token);
      }

      // 2. Check response body for token
      if (!token && responseData.token) {
        token = responseData.token;
        console.log('Token found in response body:', token);
      }

      // 3. Check response body for access_token
      if (!token && responseData.accessToken) {
        token = responseData.accessToken;
        console.log('Access token found in response body:', token);
      }

      // 4. Check response body for jwt
      if (!token && responseData.jwt) {
        token = responseData.jwt;
        console.log('JWT found in response body:', token);
      }

      // Log all response headers for debugging
      console.log('All response headers:');
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      if (!token) {
        // For now, if login is successful but no token is found,
        // we'll create a temporary token for testing
        console.warn('No token found in response, but login was successful');

        // Since the login was successful (status 200, result: SUCCESS),
        // we'll use the email as a temporary identifier
        token = btoa(JSON.stringify({ email: credentials.email, timestamp: Date.now() }));
        console.log('Created temporary token for testing:', token);
      }

      // Store token
      this.setToken(token);

      // Create user object from credentials for now
      // In a real application, the server should return user details
      const userData: AuthUser = {
        id: 'temp-id',
        email: credentials.email,
        memberName: credentials.email.split('@')[0],
        handle: credentials.email.split('@')[0],
        displayName: credentials.email.split('@')[0],
      };

      return {
        user: userData,
        token: token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // If we get a 401, the token might be expired
    if (response.status === 401) {
      this.logout();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication expired. Please login again.');
    }

    return response;
  }

  // Utility method to make authenticated API calls
  async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await this.authenticatedFetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    return response.json();
  }
}

// Create a singleton instance
export const authService = new AuthService();

// Utility functions for common operations
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const getToken = () => authService.getToken();
export const isAuthenticated = () => authService.isAuthenticated();
export const getAuthHeaders = () => authService.getAuthHeaders();
export const authenticatedFetch = (url: string, options?: RequestInit) =>
  authService.authenticatedFetch(url, options);
export const apiCall = <T>(endpoint: string, options?: RequestInit) =>
  authService.apiCall<T>(endpoint, options);