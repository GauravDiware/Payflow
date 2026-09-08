export type Role = "CUSTOMER" | "ADMIN" | "AUDITOR";

export type AccountStatus = "ACTIVE" | "BLOCKED" | "CLOSED";
export type AccountType = "SAVINGS" | "CHECKING" | "CURRENT";

export type TxnStatus =
  | "INITIATED"
  | "VALIDATING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "FLAGGED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  accountCount?: number;
}

export interface Account {
  id: string;
  accountNumber: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  createdAt: string;
  holderName: string;
}

export interface Transaction {
  reference: string;
  fromAccount: string;
  fromAccountType: string;
  toName: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
  status: TxnStatus;
  createdAt: string;
  failureReason?: string;
  flagReason?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  nickname?: string;
  verified: boolean;
}

export interface RecipientValidation {
  valid: boolean;
  message: string;
  accountHolderName: string | null;
}

export interface AppNotification {
  id: string;
  type: "transaction" | "security" | "account";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  channel?: "SMS" | "EMAIL";
  status?: "QUEUED" | "SENT" | "FAILED";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: "SUCCESS" | "FAILED";
}
