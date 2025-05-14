import { z } from 'zod';

// User schema for validation and type safety
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  is_verified: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  account_type: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type User = z.infer<typeof userSchema>;

// API response schema (for users list)
const usersResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional()
});

export type UsersResponse = z.infer<typeof usersResponseSchema>;

// Error response schema
const errorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional()
});

// Get the API base URL from environment variables
const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }
  return apiUrl;
};

// Get the auth token from localStorage
const getAuthToken = (): string => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage in server context');
  }
  
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  return token;
};

// Common headers with authorization
const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  };
};

// Fetch users
export async function fetchUsers(): Promise<UsersResponse> {
  try {
    const apiUrl = getApiUrl();
    
    const response = await fetch(`${apiUrl}/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorData = errorResponseSchema.parse(data);
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    
    // Validate the response data against the schema
    return usersResponseSchema.parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      console.error('Response validation error:', error.errors);
      throw new Error('Invalid response format from API');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unknown error occurred while fetching users');
  }
}

// Delete a user
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const apiUrl = getApiUrl();
    
    const response = await fetch(`${apiUrl}/user/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorData = errorResponseSchema.parse(data);
      throw new Error(errorData.message || `Failed to delete user ${userId}`);
    }
    
    return {
      success: true,
      message: data.message || 'User deleted successfully'
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`An unknown error occurred while deleting user ${userId}`);
  }
}

// API client object with all user-related methods
export const api = {
  users: {
    getAll: fetchUsers,
    delete: deleteUser
  }
}; 