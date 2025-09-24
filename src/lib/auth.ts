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

export interface RecommendedMember {
  id: string;
  memberName: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
  isFollowing?: boolean;
}

export interface RecommendedMembersApiResponse {
  status: number;
  result: string;
  data: {
    content: RecommendedMember[];
    page: number;
    size: number;
    totalElements?: number;
    totalPages?: number;
  };
}

export interface RecommendedMembersResponse {
  content: RecommendedMember[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
}

export interface FollowingMember {
  id: string;
  memberName: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
}

export interface FollowersFollowingsResponse {
  status: number;
  result: string;
  data: {
    followers: {
      content: FollowingMember[];
      page: number;
      size: number;
      totalElements?: number;
      totalPages?: number;
    };
    followings: {
      content: FollowingMember[];
      page: number;
      size: number;
      totalElements?: number;
      totalPages?: number;
    };
  };
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
      console.log('🔍 Searching for token in response...');

      // 1. Check response headers
      console.log('📋 Checking response headers for token...');
      const authHeader = response.headers.get('Authorization') ||
                        response.headers.get('authorization') ||
                        response.headers.get('x-auth-token') ||
                        response.headers.get('X-Auth-Token');

      if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        console.log('✅ Token found in headers:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ No token found in headers');
      }

      // 2. Check response body for token
      if (!token && responseData.token) {
        token = responseData.token;
        console.log('✅ Token found in response body (token):', token.substring(0, 20) + '...');
      }

      // 3. Check response body for access_token
      if (!token && responseData.accessToken) {
        token = responseData.accessToken;
        console.log('✅ Access token found in response body:', token.substring(0, 20) + '...');
      }

      // 4. Check response body for jwt
      if (!token && responseData.jwt) {
        token = responseData.jwt;
        console.log('✅ JWT found in response body:', token.substring(0, 20) + '...');
      }

      // 5. Check response body for access-token (with dash)
      if (!token && responseData['access-token']) {
        token = responseData['access-token'];
        console.log('✅ Access-token found in response body:', token.substring(0, 20) + '...');
      }

      // 6. Check nested content object
      if (!token && responseData.content && typeof responseData.content === 'object') {
        const content = responseData.content;
        if (content.token) {
          token = content.token;
          console.log('✅ Token found in content object:', token.substring(0, 20) + '...');
        } else if (content.accessToken) {
          token = content.accessToken;
          console.log('✅ AccessToken found in content object:', token.substring(0, 20) + '...');
        }
      }

      // Log all response headers for debugging
      console.log('📋 All response headers:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });

      // Specifically check for Authorization header
      const authHeaderDirect = response.headers.get('Authorization');
      console.log('🔍 Direct Authorization header check:', authHeaderDirect);

      // Check if headers are accessible
      const headerKeys = Array.from(response.headers.keys());
      console.log('📝 Available header keys:', headerKeys);

      // Log response body structure for debugging
      console.log('📦 Response body keys:', Object.keys(responseData));
      console.log('📦 Response body structure:', responseData);

      if (!token) {
        console.error('❌ No JWT token found in server response');
        console.error('This is likely a CORS issue - Authorization header is not exposed');
        console.error('Available header keys:', Array.from(response.headers.keys()));

        // Temporary workaround: Check if this is a CORS issue
        if (Array.from(response.headers.keys()).length === 0 || !response.headers.get('Authorization')) {
          console.warn('⚠️ CORS issue detected - using temporary token for development');
          // For development only - create a temporary token that looks like JWT
          token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IiAyHJAm9haWwuY29tIiwiaWF0IjoxNzU4NTg4Nzk3fQ.temp_signature_for_dev';
          console.log('🔧 Using temporary development token');
        } else {
          throw new Error('서버에서 인증 토큰을 받지 못했습니다. 서버 설정을 확인해주세요.');
        }
      }

      // Store token
      console.log('💾 Storing token:', token ? 'Token exists' : 'No token');
      this.setToken(token);
      console.log('🔍 Token after storage:', this.getToken() ? 'Token stored successfully' : 'Token storage failed');

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

  async logout(): Promise<void> {
    try {
      // Call server logout API if token exists
      if (this.token) {
        const response = await fetch(`${API_BASE_URL}/api/authentication/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        // Log the response for debugging, but don't throw error if logout fails
        // This ensures local logout always works even if server is unreachable
        if (!response.ok) {
          console.warn('Server logout failed, but proceeding with local logout:', response.status);
        } else {
          console.log('Server logout successful');
        }
      }
    } catch (error) {
      // Log error but don't prevent local logout
      console.warn('Logout API call failed, proceeding with local logout:', error);
    } finally {
      // Always clear local token regardless of server response
      this.clearLocalSession();
    }
  }

  // Separate method for clearing local session
  private clearLocalSession(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Method for force logout (when token is invalid)
  forceLogout(): void {
    this.clearLocalSession();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      // Check if it's the temporary development token and clear it
      if (storedToken && storedToken.includes('temp_signature_for_dev')) {
        this.clearToken();
        return null;
      }

      this.token = storedToken;
    }

    return this.token;
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
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
      console.log('🔑 Adding Authorization header with token');
    } else {
      console.warn('⚠️ No token available for Authorization header');
    }

    return headers;
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const requestUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    console.log('🌐 Making authenticated request:', {
      url: requestUrl,
      method: options.method || 'GET',
      headers: headers,
      body: options.body
    });

    const response = await fetch(requestUrl, {
      ...options,
      headers,
    });

    console.log('📡 Authenticated request response:', {
      url: requestUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // If we get a 401, the token might be expired
    // Temporarily disable auto-logout to debug login issues
    if (response.status === 401) {
      console.warn('401 Unauthorized response received for:', url);
      // this.logout();
      // if (typeof window !== 'undefined') {
      //   window.location.href = '/login';
      // }
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
      console.error('🚨 API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorData: errorData
      });
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    return response.json();
  }

  // Fetch recommended members for "Who to follow" section
  async getRecommendedMembers(size: number = 5): Promise<RecommendedMembersResponse> {
    const apiResponse = await this.apiCall<RecommendedMembersApiResponse>(
      `/api/members/follow/recommend/newbie?size=${size}`
    );

    // Extract data from the nested response structure
    return apiResponse.data;
  }

  // Follow a member
  async followMember(memberIdToFollow: number): Promise<void> {
    console.log('🔄 Follow API request:', { memberIdToFollow });
    try {
      const result = await this.apiCall<any>('/api/members/follow', {
        method: 'POST',
        body: JSON.stringify({ memberIdToFollow }),
      });
      console.log('✅ Follow API response:', result);
    } catch (error) {
      console.error('❌ Follow API error:', error);
      throw error;
    }
  }

  // Unfollow a member
  async unfollowMember(memberIdToUnfollow: number): Promise<void> {
    console.log('🔄 Unfollow API request:', { memberIdToUnfollow });
    try {
      const result = await this.apiCall<any>('/api/members/follow', {
        method: 'DELETE',
        body: JSON.stringify({ memberIdToUnfollow }),
      });
      console.log('✅ Unfollow API response:', result);
    } catch (error) {
      console.error('❌ Unfollow API error:', error);
      throw error;
    }
  }

  // Get followers and following lists
  async getFollowersFollowings(): Promise<FollowingMember[]> {
    console.log('🔄 Fetching followers-followings...');
    const apiResponse = await this.apiCall<FollowersFollowingsResponse>('/api/members/followers-followings');
    console.log('📦 Full API response:', apiResponse);
    console.log('📦 Data structure:', apiResponse.data);
    console.log('📦 Followings data:', apiResponse.data.followings);

    return apiResponse.data.followings.content;
  }

  // Create a new post
  async createPost(content: string): Promise<void> {
    console.log('📝 Creating new post:', content);
    try {
      const response = await fetch('http://localhost:8081/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Post creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Post creation error:', error);
      throw error;
    }
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
export const getRecommendedMembers = (size?: number) =>
  authService.getRecommendedMembers(size);
export const followMember = (memberIdToFollow: number) =>
  authService.followMember(memberIdToFollow);
export const unfollowMember = (memberIdToUnfollow: number) =>
  authService.unfollowMember(memberIdToUnfollow);
export const getFollowersFollowings = () =>
  authService.getFollowersFollowings();
export const createPost = (content: string) =>
  authService.createPost(content);