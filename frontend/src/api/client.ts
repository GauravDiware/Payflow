import type {
  Account,
  AppNotification,
  Beneficiary,
  RecipientValidation,
  Transaction,
  User,
} from "@/types";

const API_BASE = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem("payflow_token");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    const serverMessage = body?.message ?? "";
    // Never expose Spring's internal routing/resource paths to customers.
    if (
      serverMessage.toLowerCase().includes("no static resource") ||
      serverMessage.includes("/api/")
    ) {
      throw new Error(
        "This service is temporarily unavailable. Please try again shortly.",
      );
    }
    throw new Error(
      serverMessage || `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getAccounts(userId: number) {
  return request<Account[]>(`/users/${userId}/accounts`);
}

export function getAccount(accountId: string) {
  return request<Account>(`/accounts/${accountId}`);
}

export function getBeneficiaries(userId: number) {
  return request<Beneficiary[]>(`/users/${userId}/beneficiaries`);
}

export function createBeneficiary(
  userId: number,
  input: Pick<Beneficiary, "name" | "accountNumber" | "nickname">,
) {
  return request<Beneficiary>(`/users/${userId}/beneficiaries`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteBeneficiary(userId: number, beneficiaryId: string) {
  return request<void>(`/users/${userId}/beneficiaries/${beneficiaryId}`, {
    method: "DELETE",
  });
}

export function getNotifications(userId: number) {
  return request<AppNotification[]>(`/users/${userId}/notifications`);
}

export function createUser(input: {
  fullName: string;
  email: string;
  mobileNumber: string;
  password?: string;
  role?: User["role"];
}) {
  return request<ApiUser>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(email: string, password: string) {
  return request<{ token: string; user: ApiUser }>("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function resetPassword(
  email: string,
  mobileNumber: string,
  newPassword: string,
) {
  return request<void>("/users/password/reset", {
    method: "POST",
    body: JSON.stringify({ email, mobileNumber, newPassword }),
  });
}

export function getUserByEmail(email: string) {
  return request<ApiUser>(`/users?email=${encodeURIComponent(email)}`);
}

export function updateUser(
  userId: number,
  input: { fullName: string; email: string },
) {
  return request<ApiUser>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  return request<void>(`/users/${userId}/password`, {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: User["role"];
  status: User["status"];
  createdAt: string;
}

export function createAccount(input: {
  userId: number;
  type: Account["type"];
  currency?: string;
  initialBalance?: number;
}) {
  return request<Account>("/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function validateRecipientAccount(accountNumber: string) {
  return request<RecipientValidation>(
    `/accounts/validate/${encodeURIComponent(accountNumber)}`,
  );
}

export function createDirectTransfer(
  userId: number,
  input: {
    senderAccountId: string;
    recipientAccountNumber: string;
    amount: number;
    description?: string;
  },
) {
  return request<{
    success: boolean;
    message: string;
    transactionId: string;
    amount: number;
  }>(`/users/${userId}/transfers/direct`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createTransfer(
  userId: number,
  input: {
    fromAccountId: string;
    beneficiaryId: string;
    amount: number;
    description?: string;
  },
) {
  return request<Transaction>(`/users/${userId}/transfers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTransactions(userId: number, page = 0, size = 20) {
  return request<PageResponse<Transaction>>(
    `/users/${userId}/transactions?page=${page}&size=${size}`,
  );
}

export function getTransaction(reference: string) {
  return request<Transaction>(`/transactions/${reference}`);
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
