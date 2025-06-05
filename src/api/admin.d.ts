// Type definitions for admin.js

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminData {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  admin: AdminData;
  token: string;
}

export interface VerifyResponse {
  message: string;
  admin: AdminData;
}

export interface User {
  id: number;
  name: string;
  email: string;
  subscription_plan: string;
  created_at: string;
  last_login: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GetUsersResponse {
  users: User[];
  pagination: Pagination;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  subscription_plan?: string;
}

export interface UpdateUserData {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  subscription_plan?: string;
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

export interface DeleteUserResponse {
  message: string;
}

export interface AnalyticsData {
  userStats: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    userGrowth: Array<{
      date: string;
      count: number;
    }>;
  };
  subscriptionStats: {
    subscriptionCounts: {
      [key: string]: number;
    };
  };
  promptStats: {
    totalPrompts: number;
    promptsInPeriod: number;
    promptsByDay: Array<{
      date: string;
      count: number;
    }>;
    promptsBySport: {
      [key: string]: number;
    };
    promptsByBetType: {
      [key: string]: number;
    };
  };
  trackerStats: {
    totalPicks: number;
    picksInPeriod: number;
    picksByStatus: {
      [key: string]: number;
    };
    picksBySport: {
      [key: string]: number;
    };
    picksByDay: Array<{
      date: string;
      count: number;
    }>;
  };
}

export function loginAdmin(credentials: AdminCredentials): Promise<LoginResponse>;
export function verifyAdminToken(): Promise<VerifyResponse>;
export function logoutAdmin(): void;
export function getAdminData(): AdminData | null;
export function isAdminAuthenticated(): boolean;
export function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  subscription_plan?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<GetUsersResponse>;
export function createUser(userData: CreateUserData): Promise<CreateUserResponse>;
export function updateUser(userData: UpdateUserData): Promise<UpdateUserResponse>;
export function deleteUser(userId: number): Promise<DeleteUserResponse>;
export function getAnalytics(period?: string): Promise<AnalyticsData>;
