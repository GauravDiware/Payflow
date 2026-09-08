import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockNotifications } from "@/data/mockData";
import { getNotifications } from "@/api/client";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  LayoutDashboard,
  Wallet,
  Send,
  Users,
  FileText,
  Download,
  Settings,
  UserCog,
  ShieldAlert,
  ScrollText,
  LogOut,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const customerNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Accounts", icon: Wallet, path: "/accounts" },
  { label: "Transfer Money", icon: Send, path: "/transfer" },
  { label: "Beneficiaries", icon: Users, path: "/beneficiaries" },
  { label: "Transactions", icon: FileText, path: "/transactions" },
  { label: "Statements", icon: Download, path: "/statements" },
];

const adminNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Users", icon: UserCog, path: "/admin/users" },
  { label: "Accounts", icon: Wallet, path: "/admin/accounts" },
  {
    label: "Transaction Monitoring",
    icon: FileText,
    path: "/admin/transactions",
  },
  {
    label: "Flagged Transactions",
    icon: ShieldAlert,
    path: "/admin/flagged-transactions",
  },
  { label: "Audit Logs", icon: ScrollText, path: "/admin/audit-logs" },
];

const auditorNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/auditor/dashboard" },
  { label: "Transactions", icon: FileText, path: "/auditor/transactions" },
  {
    label: "Flagged Transactions",
    icon: ShieldAlert,
    path: "/auditor/flagged-transactions",
  },
  { label: "Audit Logs", icon: ScrollText, path: "/auditor/audit-logs" },
  { label: "Accounts", icon: Wallet, path: "/auditor/accounts" },
];

function getNavForRole(role: Role): NavItem[] {
  if (role === "ADMIN") return adminNav;
  if (role === "AUDITOR") return auditorNav;
  return customerNav;
}

function getRoleLabel(role: Role): string {
  if (role === "ADMIN") return "Admin";
  if (role === "AUDITOR") return "Auditor";
  return "";
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const nav = getNavForRole(user.role);
  const roleLabel = getRoleLabel(user.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleWorkspaceClick = () => {
    const destination =
      user.role === "ADMIN"
        ? "/admin/accounts"
        : user.role === "AUDITOR"
          ? "/auditor/accounts"
          : "/accounts";
    onClose();
    navigate(destination);
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={17} />
          </div>
          <span>payflow{roleLabel && <em> {roleLabel}</em>}</span>
        </div>
        <div
          className="workspace-switcher"
          role="button"
          tabIndex={0}
          aria-label="Open account workspace"
          onClick={handleWorkspaceClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleWorkspaceClick();
            }
          }}
        >
          <div className="workspace-icon">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <strong>{user.name}'s workspace</strong>
            <span>
              {user.role === "CUSTOMER"
                ? "Personal account"
                : roleLabel + " panel"}
            </span>
          </div>
        </div>
        <div className="nav-label">Menu</div>
        <nav className="main-nav">
          {nav.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-label">Manage</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <Settings size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={17} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
          <div className="sidebar-security">
            <ShieldCheck size={17} />
            <div>
              <strong>Your money is safe</strong>
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Header({
  onMenuClick,
  title,
}: {
  onMenuClick: () => void;
  title: string;
}) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  useEffect(() => {
    if (!user) return;
    const load = () =>
      getNotifications(user.id)
        .then(setNotifications)
        .catch(() => undefined);
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [user]);
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "transaction", label: "Transactions" },
    { key: "security", label: "Security" },
    { key: "account", label: "Account" },
  ];
  const [notifTab, setNotifTab] = useState("all");
  const filtered =
    notifTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === notifTab);

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <div className="breadcrumb">
        <span>Workspace</span>
        <ChevronRight size={15} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <button
          className="icon-button"
          onClick={() => setShowNotif(!showNotif)}
          aria-label="Notifications"
        >
          <Bell size={19} />
          <i className="notification-dot" />
        </button>
        <div className="top-divider" />
        <button className="profile-button">
          <div className="avatar">{initials}</div>
          <span>{user.name}</span>
          <ChevronDown size={15} />
        </button>
      </div>
      {showNotif && (
        <div className="notification-popover">
          <div className="popover-heading">
            <strong>Notifications</strong>
            <button onClick={() => setShowNotif(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="notif-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={notifTab === t.key ? "active" : ""}
                onClick={() => setNotifTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="notif-list">
            {filtered.length === 0 ? (
              <div className="notif-empty">
                <Bell size={22} />
                <p>You're all caught up!</p>
                <span>You don't have any new notifications.</span>
              </div>
            ) : (
              filtered.map((n) => (
                <div key={n.id} className={`notice ${n.read ? "read" : ""}`}>
                  <div
                    className={`notice-icon ${n.type === "transaction" ? "green" : n.type === "security" ? "orange" : "blue"}`}
                  >
                    {n.type === "transaction" ? (
                      <FileText size={15} />
                    ) : n.type === "security" ? (
                      <ShieldCheck size={15} />
                    ) : (
                      <UserRound size={15} />
                    )}
                  </div>
                  <div>
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                    <small>
                      {new Date(n.timestamp).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                  {!n.read && <i className="unread-dot" />}
                </div>
              ))
            )}
          </div>
          <button className="view-all" onClick={() => setShowNotif(false)}>
            Mark all as read
          </button>
        </div>
      )}
    </header>
  );
}

export function AppLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-area">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
