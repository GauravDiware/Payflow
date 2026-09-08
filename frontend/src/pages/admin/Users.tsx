import { useState } from "react";
import { Search, Eye, Ban, CheckCircle2, MoreHorizontal } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockUsers } from "@/data/mockData";
import { ConfirmModal } from "@/components/common/Modal";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/utils/format";
import type { User } from "@/types";

export default function Users() {
  const { show } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [actionMode, setActionMode] = useState<"block" | "activate">("block");

  const filtered = users.filter(
    (u) =>
      (!search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter),
  );

  const handleConfirm = () => {
    if (!blockTarget) return;
    setUsers(
      users.map((u) =>
        u.id === blockTarget.id
          ? { ...u, status: actionMode === "block" ? "BLOCKED" : "ACTIVE" }
          : u,
      ),
    );
    show(
      actionMode === "block"
        ? `${blockTarget.name} has been blocked`
        : `${blockTarget.name} has been activated`,
    );
    setBlockTarget(null);
  };

  return (
    <AppLayout title="User Management">
      <PageIntro
        eyebrow="Admin / Users"
        title="User Management"
        description="Manage users, roles, and access."
      />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
          />
        </div>
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
          <option value="AUDITOR">Auditor</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="transaction-name">
                    <div className="transaction-avatar">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td className="muted-cell">{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${u.status === "ACTIVE" ? "success" : "flagged"}`}
                  >
                    <i />
                    {u.status === "ACTIVE" ? "Active" : "Blocked"}
                  </span>
                </td>
                <td className="muted-cell">{formatDate(u.createdAt)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button small-icon" title="View">
                      <Eye size={16} />
                    </button>
                    {u.status === "ACTIVE" ? (
                      <button
                        className="icon-button small-icon danger-icon"
                        title="Block"
                        onClick={() => {
                          setBlockTarget(u);
                          setActionMode("block");
                        }}
                      >
                        <Ban size={16} />
                      </button>
                    ) : (
                      <button
                        className="icon-button small-icon"
                        title="Activate"
                        onClick={() => {
                          setBlockTarget(u);
                          setActionMode("activate");
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button className="row-more">
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleConfirm}
        title={actionMode === "block" ? "Block User?" : "Activate User?"}
        message={
          actionMode === "block"
            ? `This action will restrict access to the application for ${blockTarget?.name}.`
            : `This will restore access for ${blockTarget?.name}.`
        }
        confirmLabel={actionMode === "block" ? "Block User" : "Activate User"}
        danger={actionMode === "block"}
      />
    </AppLayout>
  );
}
