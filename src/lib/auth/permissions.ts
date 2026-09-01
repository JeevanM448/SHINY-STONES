import type { UserRole } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar?: string;
}

export const mockCurrentUser: AuthUser = {
  id: "user-1",
  name: "Jeevan Elias",
  email: "jeevan.elias@shinystone.com",
  role: "admin",
  title: "AI Engineer",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeevan",
};

export function canAccessTeamPerformance(role: UserRole) {
  return role === "admin" || role === "sales_manager";
}

export function canManageUsers(role: UserRole) {
  return role === "admin";
}

export function canEdit(role: UserRole) {
  return role !== "viewer";
}
