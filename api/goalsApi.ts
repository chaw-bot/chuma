import { Platform } from 'react-native';

// Savings Goals API (sandbox). No auth — local/sandbox use only.
// Override the base URL with EXPO_PUBLIC_GOALS_API_URL when running against a
// real host. On the Android emulator the host machine is reachable at 10.0.2.2,
// while the iOS simulator can use localhost directly.
const DEFAULT_BASE_URL =
  Platform.OS === 'android'
    ? 'https://chuma.usepaynow.com/api'
    : 'https://chuma.usepaynow.com/api';
// const DEFAULT_BASE_URL =
//   Platform.OS === 'android'
//     ? 'http://192.168.1.189:4033/api'
//     : 'http://192.168.1.189:4033/api';

export const GOALS_API_BASE_URL =
  process.env.EXPO_PUBLIC_GOALS_API_URL ?? DEFAULT_BASE_URL;

export type Operator = 'airtel' | 'mtn' | 'zamtel' | 'tnm';
export type Country = 'zm' | 'mw';
export type CollectionStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'pay-offline'
  | '3ds-auth-required';

export interface ApiGoal {
  id: string;
  name: string;
  category?: string;
  color?: string;
  currentAmount: number;
  targetAmount: number;
  timelineMonths?: number;
  createdAt?: string;
  autoSaveActive?: boolean;
  autoSaveAmount?: number;
  autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  autoSaveStartDate?: string;
  autoSaveCreatedAt?: string;
  autoSaveLastChargedAt?: string;
  // Added by the API:
  due: boolean;
  nextDueAt: string | null;
}

export interface ChargeRequest {
  phone: string;
  operator: Operator;
  country?: Country;
  amount?: number;
}

export interface ChargeResponse {
  reference: string;
  amount: number;
  goalId: string;
  status: CollectionStatus;
  message: string;
  record: unknown;
  lenco: unknown;
}

export interface ConfirmResponse {
  applied: boolean;
  status: CollectionStatus;
  reference: string;
  amountApplied?: number;
  goal: ApiGoal;
}

export interface WithdrawRequest {
  phone: string;
  operator: Operator;
  country?: Country;
  amount?: number;
}

// Withdraw mirrors the charge/confirm pattern: the initial call may settle
// immediately (applied) or return "pending", in which case poll withdraw/confirm.
export interface WithdrawResponse {
  reference: string;
  applied: boolean;
  status: CollectionStatus | 'pending' | 'successful' | 'failed';
  amount?: number;
  message?: string;
  goal?: ApiGoal;
}

export interface ConfirmWithdrawResponse {
  applied: boolean;
  status: CollectionStatus | 'pending' | 'successful' | 'failed';
  reference: string;
  amountApplied?: number;
  goal?: ApiGoal;
}

export class GoalsApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'GoalsApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${GOALS_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new GoalsApiError(
      'Could not reach the savings server. Check your connection and try again.',
      0
    );
  }

  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : `Request failed (${response.status})`;
    throw new GoalsApiError(message, response.status);
  }

  return body as T;
}

export const listGoals = (uid: string) =>
  request<ApiGoal[]>(`/sandbox/users/${uid}/goals`);

export const listDueGoals = (uid: string) =>
  request<ApiGoal[]>(`/sandbox/users/${uid}/goals/due`);

export const getGoal = (uid: string, goalId: string) =>
  request<ApiGoal>(`/sandbox/users/${uid}/goals/${goalId}`);

export const chargeGoal = (uid: string, goalId: string, body: ChargeRequest) =>
  request<ChargeResponse>(`/sandbox/users/${uid}/goals/${goalId}/charge`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const confirmCharge = (uid: string, goalId: string, reference: string) =>
  request<ConfirmResponse>(`/sandbox/users/${uid}/goals/${goalId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });

export const withdrawGoal = (
  uid: string,
  goalId: string,
  body: WithdrawRequest
) =>
  request<WithdrawResponse>(`/sandbox/users/${uid}/goals/${goalId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const confirmWithdraw = (uid: string, goalId: string, reference: string) =>
  request<ConfirmWithdrawResponse>(
    `/sandbox/users/${uid}/goals/${goalId}/withdraw/confirm`,
    {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }
  );
