import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, User } from "@/types";
import { mockUsers } from "@/data/mockData";

interface AuthState {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem("payflow_user") ?? "null",
      ) as User | null;
    } catch {
      return null;
    }
  });

  const login = (user: User, token: string) => {
    window.localStorage.setItem("payflow_user", JSON.stringify(user));
    window.localStorage.setItem("payflow_token", token);
    setUser(user);
  };

  const logout = () => {
    window.localStorage.removeItem("payflow_user");
    window.localStorage.removeItem("payflow_token");
    setUser(null);
  };

  const switchRole = (role: Role) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) setUser({ ...found });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
