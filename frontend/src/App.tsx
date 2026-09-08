import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

import Login from "@/pages/shared/Login";
import Register from "@/pages/shared/Register";
import ForgotPassword from "@/pages/shared/ForgotPassword";
import {
  Unauthorized,
  SessionExpired,
  NotFound,
} from "@/pages/shared/ErrorPages";

import Dashboard from "@/pages/customer/Dashboard";
import Accounts from "@/pages/customer/Accounts";
import AccountDetails from "@/pages/customer/AccountDetails";
import Transfer from "@/pages/customer/Transfer";
import Beneficiaries from "@/pages/customer/Beneficiaries";
import Transactions from "@/pages/customer/Transactions";
import TransactionDetails from "@/pages/customer/TransactionDetails";
import Statements from "@/pages/customer/Statements";
import Settings from "@/pages/customer/Settings";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import Users from "@/pages/admin/Users";
import AdminAccounts from "@/pages/admin/AdminAccounts";
import TransactionMonitoring from "@/pages/admin/TransactionMonitoring";
import FlaggedTransactions from "@/pages/admin/FlaggedTransactions";
import AuditLogs from "@/pages/admin/AuditLogs";

import AuditorDashboard from "@/pages/auditor/AuditorDashboard";
import {
  AuditorTransactions,
  AuditorFlagged,
  AuditorAuditLogs,
  AuditorAccounts,
} from "@/pages/auditor/AuditorPages";

import type { Role } from "@/types";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/session-expired" element={<SessionExpired />} />

      {/* Customer routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Accounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:accountId"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <AccountDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Transfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/beneficiaries"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Beneficiaries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions/:reference"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <TransactionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statements"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <Statements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/accounts"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAccounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <TransactionMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/:reference"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <TransactionMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/flagged-transactions"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <FlaggedTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "AUDITOR"]}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      {/* Auditor routes */}
      <Route
        path="/auditor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["AUDITOR"]}>
            <AuditorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/transactions"
        element={
          <ProtectedRoute allowedRoles={["AUDITOR"]}>
            <AuditorTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/flagged-transactions"
        element={
          <ProtectedRoute allowedRoles={["AUDITOR"]}>
            <AuditorFlagged />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["AUDITOR"]}>
            <AuditorAuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/accounts"
        element={
          <ProtectedRoute allowedRoles={["AUDITOR"]}>
            <AuditorAccounts />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
