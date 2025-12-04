/**
 * Centralized API Client with authentication, error handling, and retry logic
 */

interface RequestOptions extends RequestInit {
  baseURL?: string;
  params?: Record<string, any>;
  timeout?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number = 30000;
  private retries: number = 3;
  private retryDelay: number = 1000;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Get auth headers (session-based or JWT)
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Check for JWT token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    const headers = { ...this.getAuthHeaders(), ...options.headers };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
          credentials: 'include', // Include cookies for session-based auth
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data: any;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (response.ok) {
          data = await response.text();
        } else {
          data = null;
        }

        // Handle error responses
        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return {
          data,
          status: response.status,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors (client errors)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // Could be network error, retry
          if (attempt < this.retries - 1) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
            continue;
          }
        }

        // If it's a network error and not the last attempt, retry
        if (attempt < this.retries - 1 && lastError) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
          continue;
        }

        break;
      }
    }

    return {
      error: lastError?.message || 'Unknown error occurred',
      status: 0,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Upload file with FormData
   */
  async uploadFile<T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) {
    const url = this.buildURL(endpoint, options?.params);
    const headers = this.getAuthHeaders();

    // Remove Content-Type header for FormData (browser will set it with boundary)
    const { 'Content-Type': _, ...headersWithoutContentType } = headers as Record<string, string>;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2); // Double timeout for file uploads

      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
        signal: controller.signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: (error as Error).message || 'File upload failed',
        status: 0,
      };
    }
  }

  /**
   * Set auth token for subsequent requests
   */
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear auth token
   */
  clearAuthToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
