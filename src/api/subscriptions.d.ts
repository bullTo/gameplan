// Type definitions for subscriptions.js

export interface SubscriptionPlan {
  id: number;
  name: string;
  key: string;
  price: number;
  billing_cycle: string;
  features: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetSubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface CreateSubscriptionPlanData {
  name: string;
  key: string;
  price: number;
  billing_cycle: string;
  features?: string[];
  is_default?: boolean;
  is_active?: boolean;
}

export interface UpdateSubscriptionPlanData {
  id: number;
  name?: string;
  key?: string;
  price?: number;
  billing_cycle?: string;
  features?: string[];
  is_default?: boolean;
  is_active?: boolean;
}

export interface CreateSubscriptionPlanResponse {
  message: string;
  plan: SubscriptionPlan;
}

export interface UpdateSubscriptionPlanResponse {
  message: string;
  plan: SubscriptionPlan;
}

export interface DeleteSubscriptionPlanResponse {
  message: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  plan_key: string;
  billing_cycle: string;
  status: string;
  start_date: string;
  end_date: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface GetUserSubscriptionsResponse {
  subscriptions: UserSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UpdateUserSubscriptionData {
  id: number;
  plan_id?: number;
  status?: string;
  end_date?: string;
}

export interface UpdateUserSubscriptionResponse {
  message: string;
  subscription: UserSubscription;
}

export function getSubscriptionPlans(): Promise<GetSubscriptionPlansResponse>;
export function createSubscriptionPlan(planData: CreateSubscriptionPlanData): Promise<CreateSubscriptionPlanResponse>;
export function updateSubscriptionPlan(planData: UpdateSubscriptionPlanData): Promise<UpdateSubscriptionPlanResponse>;
export function deleteSubscriptionPlan(planId: number): Promise<DeleteSubscriptionPlanResponse>;
export function getUserSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  plan_key?: string;
  search?: string;
}): Promise<GetUserSubscriptionsResponse>;
export function updateUserSubscription(subscriptionData: UpdateUserSubscriptionData): Promise<UpdateUserSubscriptionResponse>;
