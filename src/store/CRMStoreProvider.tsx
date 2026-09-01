"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import * as store from "./crmStore";
import { initStore } from "./crmStore";

const CRMStoreContext = createContext<typeof store | null>(null);

export function CRMStoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initStore();
  }, []);

  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return (
    <CRMStoreContext.Provider value={store}>{children}</CRMStoreContext.Provider>
  );
}

export function useCRMStore() {
  const ctx = useContext(CRMStoreContext);
  if (!ctx) throw new Error("useCRMStore must be used within CRMStoreProvider");
  useSyncExternalStore(ctx.subscribe, ctx.getSnapshot, ctx.getSnapshot);
  return ctx;
}

export function useCRMState() {
  const ctx = useCRMStore();
  return ctx.getSnapshot();
}

export function useCurrentUser() {
  const ctx = useCRMStore();
  return ctx.getCurrentUser();
}

export function useDashboardMetrics() {
  const ctx = useCRMStore();
  return ctx.getDashboardMetrics();
}

export function usePermissions() {
  const user = useCurrentUser();
  const role = user?.role ?? "viewer";
  return {
    user,
    role,
    canEdit: role !== "viewer",
    canManageUsers: role === "admin",
    canAccessTeamPerformance: role === "admin" || role === "sales_manager",
    isReadOnly: role === "viewer",
  };
}
