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
  memberId?: number;
  location?: string;
  websiteUrl?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  languageCode?: string;
  countryCode?: string;
  privacyLevel?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  followersCount?: number;
  followingCount?: number;
}

export interface ProfileData {
  memberName: string;
  displayName: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  languageCode?: string;
  countryCode?: string;
  privacyLevel?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  avatarUrl?: string;
  previousAvatarUrl?: string[];
}

export interface HandleUpdateData {
  newHandle: string;
}

export interface ImageDeleteRequest {
  imageUrls: string[];
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

export interface Post {
  id: number;
  content: string;
  memberName?: string;
  memberHandle?: string;
  memberDisplayName?: string;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  // Additional fields that may come from the API
  authorName?: string;
  authorHandle?: string;
  author?: {
    name?: string;
    handle?: string;
    displayName?: string;
  };
  [key: string]: any; // Allow for other fields during debugging
}

export interface PostDetail extends Post {
  memberId?: number;
  memberAvatarUrl?: string;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  memberName?: string;
  memberHandle?: string;
  memberDisplayName?: string;
  memberAvatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostsResponse {
  status: number;
  result: string;
  data: {
    content: Post[];
    page: number;
    size: number;
    totalElements?: number;
    totalPages?: number;
  };
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

      // Create user object from response data
      // Extract user details from the login response
      // Check multiple possible field names for memberId
      const extractedMemberId = responseData.memberId ||
                               responseData.member_id ||
                               responseData.id ||
                               responseData.userId ||
                               responseData.user_id ||
                               responseData.content?.memberId ||
                               responseData.content?.id ||
                               responseData.data?.memberId ||
                               responseData.data?.id;

      console.log('🔍 Searching for memberId in response:', {
        'responseData.memberId': responseData.memberId,
        'responseData.member_id': responseData.member_id,
        'responseData.id': responseData.id,
        'responseData.userId': responseData.userId,
        'responseData.content?.memberId': responseData.content?.memberId,
        'responseData.data?.memberId': responseData.data?.memberId,
        'extracted': extractedMemberId
      });

      const userData: AuthUser = {
        id: extractedMemberId?.toString() || 'temp-id',
        email: responseData.email || responseData.content?.email || credentials.email,
        memberName: responseData.memberName || responseData.content?.memberName || responseData.name || credentials.email.split('@')[0],
        handle: responseData.handle || responseData.content?.handle || responseData.memberHandle || credentials.email.split('@')[0],
        displayName: responseData.displayName || responseData.content?.displayName || responseData.memberName || responseData.name || credentials.email.split('@')[0],
        memberId: extractedMemberId ? (typeof extractedMemberId === 'number' ? extractedMemberId : parseInt(extractedMemberId)) : undefined,
        avatarUrl: responseData.avatarUrl || responseData.content?.avatarUrl || responseData.profileImageUrl,
        followersCount: responseData.followersCount || responseData.content?.followersCount,
        followingCount: responseData.followingCount || responseData.content?.followingCount,
      };

      console.log('📤 Extracted user data:', userData);
      console.log('📤 MemberId specifically:', userData.memberId);

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
        errorData: errorData,
        method: options.method,
        body: options.body
      });

      // Try to extract error message from various possible locations
      const errorMessage = errorData.message ||
                          errorData.error ||
                          errorData.data ||
                          `API call failed: ${response.status}`;

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Fetch recommended members for "Who to follow" section
  async getRecommendedMembers(size: number = 5): Promise<RecommendedMembersResponse> {
    const apiResponse = await this.apiCall<RecommendedMembersApiResponse>(
      `/api/members/follow/recommend/newbie?size=${size}`
    );

    const responseData = apiResponse.data;

    const mappedContent = responseData.content.map(member => ({
      ...member,
      handle: member.handle || (member as any).memberHandle || member.memberName
    }));

    return {
      ...responseData,
      content: mappedContent
    };
  }

  // Follow a member
  async followMember(memberIdToFollow: number): Promise<void> {
    console.log('🔄 Follow API request:', { memberIdToFollow });
    console.log('📤 Sending follow request with body:', JSON.stringify({ memberIdToFollow }));

    try {
      const result = await this.apiCall<any>('/api/members/follow', {
        method: 'POST',
        body: JSON.stringify({ memberIdToFollow }),
      });
      console.log('✅ Follow API response:', result);
    } catch (error: any) {
      console.error('❌ Follow API error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      // Check if it's a "cannot follow yourself" error
      if (error.message && error.message.includes('자기')) {
        throw new Error('자기 자신을 팔로우할 수 없습니다.');
      }
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

    const followingContent = apiResponse.data.followings.content;

    const mappedContent = followingContent.map(member => ({
      ...member,
      handle: member.handle || (member as any).memberHandle || member.memberName
    }));

    return mappedContent;
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

  // Get user's posts
  async getUserPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    console.log('📖 Fetching user posts...');
    try {
      const response = await fetch(`http://localhost:8081/api/posts?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch posts:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch posts: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Posts fetched successfully:', result);
      console.log('📊 Sample post data:', result.data?.content?.[0] || result.content?.[0] || result[0]);

      // Handle different response structures
      let posts: Post[] = [];
      if (result.data && result.data.content) {
        posts = result.data.content;
      } else if (result.content) {
        posts = result.content;
      } else if (Array.isArray(result)) {
        posts = result;
      } else {
        console.warn('Unexpected response structure:', result);
        return [];
      }

      // Map backend field names to frontend field names
      return posts.map(post => {
        const mappedPost = {
          id: post.id,
          content: post.content,
          memberName: post.authorName || post.memberName,
          memberHandle: post.authorHandle || post.memberHandle,
          memberDisplayName: post.authorName || post.memberDisplayName,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          // Map count fields from backend naming to frontend naming
          likesCount: post.likeCount ?? post.likesCount ?? 0,
          commentsCount: post.commentCount ?? post.commentsCount ?? 0,
          sharesCount: post.shareCount ?? post.sharesCount ?? 0,
          isLiked: post.isLiked ?? false
        };
        console.log(`Post ${mappedPost.id} - likesCount: ${mappedPost.likesCount}, isLiked: ${mappedPost.isLiked}`);
        return mappedPost;
      });
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      throw error;
    }
  }

  // Get post detail by ID
  async getPostDetail(postId: number): Promise<PostDetail> {
    console.log('📄 Fetching post detail for ID:', postId);
    try {
      const response = await fetch(`http://localhost:8081/api/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch post detail:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch post detail: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post detail fetched successfully:', result);
      console.log('📊 Post detail data:', result.data || result);

      // Handle different response structures
      let postDetail: PostDetail;
      if (result.data) {
        postDetail = result.data;
      } else {
        postDetail = result;
      }

      // Map backend field names to frontend field names
      const mappedPostDetail = {
        id: postDetail.id,
        content: postDetail.content,
        memberName: postDetail.authorName || postDetail.memberName,
        memberHandle: postDetail.authorHandle || postDetail.memberHandle,
        memberDisplayName: postDetail.authorName || postDetail.memberDisplayName,
        memberId: postDetail.authorId || postDetail.memberId,
        memberAvatarUrl: postDetail.memberAvatarUrl,
        createdAt: postDetail.createdAt,
        updatedAt: postDetail.updatedAt,
        // Map count fields from backend naming to frontend naming
        likesCount: postDetail.likeCount ?? postDetail.likesCount ?? 0,
        commentsCount: postDetail.commentCount ?? postDetail.commentsCount ?? 0,
        sharesCount: postDetail.shareCount ?? postDetail.sharesCount ?? 0,
        isLiked: postDetail.isLiked ?? false
      };
      console.log(`Post detail ${mappedPostDetail.id} - likesCount: ${mappedPostDetail.likesCount}, isLiked: ${mappedPostDetail.isLiked}`);
      return mappedPostDetail;
    } catch (error) {
      console.error('❌ Error fetching post detail:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getPostComments(postId: number): Promise<Comment[]> {
    console.log('💬 Fetching comments for post ID:', postId);
    try {
      const response = await fetch(`http://localhost:8081/api/comments/post/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch comments:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch comments: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Comments fetched successfully:', result);

      // Handle different response structures
      if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.data && result.data.content) {
        return result.data.content;
      } else if (Array.isArray(result)) {
        return result;
      } else {
        console.warn('Unexpected response structure:', result);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      throw error;
    }
  }

  // Like a post
  async likePost(postId: number): Promise<number | void> {
    console.log('❤️ Liking post ID:', postId);
    try {
      const response = await fetch(`http://localhost:8081/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to like post:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to like post: ${response.status}`);
      }

      const result = await response.json().catch(() => ({}));
      console.log('✅ Post liked successfully:', result);
      // Return updated like count if provided by backend
      if (result.data && typeof result.data === 'number') {
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error liking post:', error);
      throw error;
    }
  }

  // Unlike a post
  async unlikePost(postId: number): Promise<number | void> {
    console.log('💔 Unliking post ID:', postId);
    try {
      const response = await fetch(`http://localhost:8081/api/posts/${postId}/like`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to unlike post:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to unlike post: ${response.status}`);
      }

      const result = await response.json().catch(() => ({}));
      console.log('✅ Post unliked successfully:', result);
      // Return updated like count if provided by backend
      if (result.data && typeof result.data === 'number') {
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error unliking post:', error);
      throw error;
    }
  }

  // Get most popular posts
  async getMostPopularPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    try {
      const response = await fetch(`http://localhost:8082/api/timeline/posts/most-popular?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch popular posts:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch popular posts: ${response.status}`);
      }

      const result = await response.json();

      // Handle different response structures
      let posts: Post[] = [];
      if (result.data && result.data.content) {
        posts = result.data.content;
      } else if (result.content) {
        posts = result.content;
      } else if (Array.isArray(result)) {
        posts = result;
      } else if (result.data && Array.isArray(result.data)) {
        posts = result.data;
      } else {
        console.warn('Unexpected response structure:', result);
        return [];
      }

      // Map backend field names to frontend field names
      return posts.map(post => {
        const mappedPost = {
          id: post.id || post._id,
          content: post.content,
          memberName: post.authorName || post.writerName || post.userName || post.memberName || post.author?.name || post.writer?.name || post.user?.name || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          memberHandle: post.memberHandle || post.authorHandle || post.writerHandle || post.userHandle || post.author?.handle || post.writer?.handle || post.user?.handle || post.handle || (post.authorId ? `user${post.authorId}` : 'unknown'),
          memberDisplayName: post.authorName || post.writerName || post.userName || post.displayName || post.memberDisplayName || post.author?.displayName || post.writer?.displayName || post.user?.displayName || post.memberName || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          createdAt: post.createdAt || post.createdDate || post.timestamp,
          updatedAt: post.updatedAt || post.updatedDate,
          authorId: post.authorId,
          likesCount: post.likeCount ?? post.likesCount ?? 0,
          commentsCount: post.commentCount ?? post.commentsCount ?? 0,
          sharesCount: post.shareCount ?? post.sharesCount ?? 0,
          isLiked: post.isLiked ?? false
        };
        return mappedPost;
      });
    } catch (error) {
      console.error('❌ Error fetching popular posts:', error);
      throw error;
    }
  }

  // Get most commented posts
  async getMostCommentedPosts(page: number = 0, size: number = 20): Promise<Post[]> {
    try {
      const response = await fetch(`http://localhost:8082/api/timeline/posts/most-commented?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch most commented posts:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch most commented posts: ${response.status}`);
      }

      const result = await response.json();

      // Handle different response structures
      let posts: Post[] = [];
      if (result.data && result.data.content) {
        posts = result.data.content;
      } else if (result.content) {
        posts = result.content;
      } else if (Array.isArray(result)) {
        posts = result;
      } else if (result.data && Array.isArray(result.data)) {
        posts = result.data;
      } else {
        console.warn('Unexpected response structure:', result);
        return [];
      }

      // Map backend field names to frontend field names
      return posts.map(post => {
        const mappedPost = {
          id: post.id || post._id,
          content: post.content,
          memberName: post.authorName || post.writerName || post.userName || post.memberName || post.author?.name || post.writer?.name || post.user?.name || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          memberHandle: post.memberHandle || post.authorHandle || post.writerHandle || post.userHandle || post.author?.handle || post.writer?.handle || post.user?.handle || post.handle || (post.authorId ? `user${post.authorId}` : 'unknown'),
          memberDisplayName: post.authorName || post.writerName || post.userName || post.displayName || post.memberDisplayName || post.author?.displayName || post.writer?.displayName || post.user?.displayName || post.memberName || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          createdAt: post.createdAt || post.createdDate || post.timestamp,
          updatedAt: post.updatedAt || post.updatedDate,
          authorId: post.authorId,
          likesCount: post.likeCount ?? post.likesCount ?? 0,
          commentsCount: post.commentCount ?? post.commentsCount ?? 0,
          sharesCount: post.shareCount ?? post.sharesCount ?? 0,
          isLiked: post.isLiked ?? false
        };
        return mappedPost;
      });
    } catch (error) {
      console.error('❌ Error fetching most commented posts:', error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(memberId: number, file: File): Promise<{ imageId: string; imageUrl?: string; thumbnailUrl?: string }> {
    try {
      const formData = new FormData();
      // Server expects 'image' as the field name, not 'file'
      formData.append('image', file);

      console.log('📤 Uploading profile image...');
      console.log('📤 File details:', { name: file.name, size: file.size, type: file.type });
      console.log('📤 Token present:', !!this.token);

      const response = await fetch(`http://localhost:8085/api/images/upload/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          // Note: Don't set Content-Type for multipart/form-data, let the browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to upload profile image:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to upload image: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Profile image uploaded successfully:', result);

      // Extract viewId from the response
      // The response format is: {"status":200,"result":"SUCCESS","data":"uuid-string"}
      // where data is the viewId directly
      const viewId = typeof result.data === 'string' ? result.data : (result.data?.viewId || result.viewId);

      if (!viewId) {
        console.error('❌ No viewId in response:', result);
        throw new Error('Upload succeeded but no viewId returned');
      }

      console.log('📌 Extracted viewId:', viewId);

      // Construct the image URL using viewId
      const imageUrl = `http://localhost:8085/api/images/view/${viewId}`;
      const thumbnailUrl = `http://localhost:8085/api/images/view/${viewId}?thumbnail=true`;

      console.log('📸 Image URLs:', { imageUrl, thumbnailUrl });

      // Return the viewId and constructed URLs
      return {
        imageId: viewId,
        imageUrl: imageUrl,
        thumbnailUrl: thumbnailUrl
      };
    } catch (error) {
      console.error('❌ Error uploading profile image:', error);
      throw error;
    }
  }

  // Get image URL
  getImageUrl(imageId: string, thumbnail: boolean = false): string {
    const baseUrl = `http://localhost:8085/api/images/view/${imageId}`;
    return thumbnail ? `${baseUrl}?thumbnail=true` : baseUrl;
  }

  // Get image with authorization header
  async getImage(imageId: string, thumbnail: boolean = false): Promise<string> {
    try {
      const url = this.getImageUrl(imageId, thumbnail);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        }
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch image:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Convert response to blob and create object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('❌ Error fetching image:', error);
      throw error;
    }
  }

  async getMyProfile(): Promise<AuthUser> {
    console.log('👤 Fetching my profile...');
    try {
      const response = await this.authenticatedFetch('http://localhost:8084/api/members/profile');

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Profile fetched:', result);

      const profileData = result.data || result;
      return {
        id: profileData.memberId?.toString() || profileData.id,
        email: profileData.email,
        memberName: profileData.memberName,
        handle: profileData.handle,
        displayName: profileData.displayName,
        bio: profileData.bio,
        avatarUrl: profileData.avatarUrl,
        memberId: profileData.memberId,
        location: profileData.location,
        websiteUrl: profileData.websiteUrl,
        birthDate: profileData.birthDate,
        gender: profileData.gender,
        languageCode: profileData.languageCode,
        countryCode: profileData.countryCode,
        privacyLevel: profileData.privacyLevel,
        followersCount: profileData.followersCount,
        followingCount: profileData.followingCount,
      };
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: ProfileData): Promise<void> {
    console.log('✏️ Updating profile...', profileData);
    try {
      const response = await this.authenticatedFetch('http://localhost:8084/api/members/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  async updateHandle(handleData: HandleUpdateData): Promise<void> {
    console.log('✏️ Updating handle...', handleData);
    try {
      const response = await this.authenticatedFetch('http://localhost:8084/api/members/profile/handle', {
        method: 'PUT',
        body: JSON.stringify(handleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update handle: ${response.status}`);
      }

      console.log('✅ Handle updated successfully');
    } catch (error) {
      console.error('❌ Error updating handle:', error);
      throw error;
    }
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    console.log('🗑️ Deleting images...', imageUrls);
    try {
      const response = await this.authenticatedFetch('http://localhost:8085/api/images/view/command/delete/in', {
        method: 'POST',
        body: JSON.stringify({ imageUrls }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete images: ${response.status}`);
      }

      console.log('✅ Images deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting images:', error);
      throw error;
    }
  }

  // Get following members' timeline posts
  async getFollowingTimelinePosts(page: number = 0, size: number = 20): Promise<Post[]> {
    try {
      const response = await fetch(`http://localhost:8082/api/timeline/posts/followings?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch timeline posts:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Failed to fetch timeline posts: ${response.status}`);
      }

      const result = await response.json();

      // Handle different response structures
      let posts: Post[] = [];
      if (result.data && result.data.content) {
        posts = result.data.content;
      } else if (result.content) {
        posts = result.content;
      } else if (Array.isArray(result)) {
        posts = result;
      } else {
        console.warn('Unexpected response structure:', result);
        return [];
      }

      // Map backend field names to frontend field names (following same pattern as getUserPosts)
      return posts.map(post => {
        // Map backend field names to frontend field names

        const mappedPost = {
          id: post.id || post._id, // MongoDB might use _id
          content: post.content,
          // Map author fields to member fields for consistent UI rendering
          // Backend currently returns null for authorName and memberHandle, so use authorId as fallback
          memberName: post.authorName || post.writerName || post.userName || post.memberName || post.author?.name || post.writer?.name || post.user?.name || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          memberHandle: post.memberHandle || post.authorHandle || post.writerHandle || post.userHandle || post.author?.handle || post.writer?.handle || post.user?.handle || post.handle || (post.authorId ? `user${post.authorId}` : 'unknown'),
          memberDisplayName: post.authorName || post.writerName || post.userName || post.displayName || post.memberDisplayName || post.author?.displayName || post.writer?.displayName || post.user?.displayName || post.memberName || (post.authorId ? `User ${post.authorId}` : 'Unknown User'),
          createdAt: post.createdAt || post.createdDate || post.timestamp,
          updatedAt: post.updatedAt || post.updatedDate,
          // Store authorId for future use
          authorId: post.authorId,
          // Map count fields from backend naming to frontend naming
          likesCount: post.likeCount ?? post.likesCount ?? 0,
          commentsCount: post.commentCount ?? post.commentsCount ?? 0,
          sharesCount: post.shareCount ?? post.sharesCount ?? 0,
          isLiked: post.isLiked ?? false
        };
        return mappedPost;
      });
    } catch (error) {
      console.error('❌ Error fetching timeline posts:', error);
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
export const getUserPosts = (page?: number, size?: number) =>
  authService.getUserPosts(page, size);
export const getPostDetail = (postId: number) =>
  authService.getPostDetail(postId);
export const getPostComments = (postId: number) =>
  authService.getPostComments(postId);
export const likePost = (postId: number) =>
  authService.likePost(postId);
export const unlikePost = (postId: number) =>
  authService.unlikePost(postId);

// Get following members' timeline posts
export const getFollowingTimelinePosts = (page?: number, size?: number) =>
  authService.getFollowingTimelinePosts(page, size);

// Get most popular posts
export const getMostPopularPosts = (page?: number, size?: number) =>
  authService.getMostPopularPosts(page, size);

// Get most commented posts
export const getMostCommentedPosts = (page?: number, size?: number) =>
  authService.getMostCommentedPosts(page, size);

// Image upload and retrieval
export const uploadProfileImage = (memberId: number, file: File) =>
  authService.uploadProfileImage(memberId, file);

export const getImageUrl = (imageId: string, thumbnail?: boolean) =>
  authService.getImageUrl(imageId, thumbnail);

export const getImage = (imageId: string, thumbnail?: boolean) =>
  authService.getImage(imageId, thumbnail);

export const getMyProfile = () =>
  authService.getMyProfile();

export const updateProfile = (profileData: ProfileData) =>
  authService.updateProfile(profileData);

export const updateHandle = (handleData: HandleUpdateData) =>
  authService.updateHandle(handleData);

export const deleteImages = (imageUrls: string[]) =>
  authService.deleteImages(imageUrls);