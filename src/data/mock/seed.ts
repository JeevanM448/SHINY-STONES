export {
  mockUsers,
  mockCustomers,
  mockContacts,
  mockDeals,
  mockActivities,
  mockPurchaseOrders,
  mockFollowUps,
  mockEmailThreads,
  mockWorkflows,
} from "../mock/index";

import type { AppNotification, CRMState, SalesTargetRecord } from "@/store/types";
import { defaultSettings } from "@/store/types";
import {
  mockUsers,
  mockCustomers,
  mockContacts,
  mockDeals,
  mockActivities,
  mockPurchaseOrders,
  mockFollowUps,
  mockEmailThreads,
  mockWorkflows,
} from "../mock/index";

export const seedNotifications: AppNotification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    title: "New email received",
    message: "ABC Corporation requested a revised quotation",
    type: "email",
    read: false,
    timestamp: "2026-09-01T05:12:00Z",
    href: "/inbox",
  },
  {
    id: "notif-2",
    userId: "user-1",
    title: "Follow-up overdue",
    message: "Send updated pricing sheet for Global Industries",
    type: "follow-up",
    read: false,
    timestamp: "2026-08-30T10:00:00Z",
    href: "/follow-ups",
  },
  {
    id: "notif-3",
    userId: "user-1",
    title: "PO pending approval",
    message: "PO-10245 awaiting review",
    type: "po",
    read: true,
    timestamp: "2026-08-29T11:00:00Z",
    href: "/purchase-orders/po-1",
  },
];

export const seedSalesTargets: SalesTargetRecord[] = [
  { id: "st-1", userId: "user-2", period: "2026-Q3", targetAmount: 5000000, achievedAmount: 4200000 },
  { id: "st-2", userId: "user-3", period: "2026-Q3", targetAmount: 4000000, achievedAmount: 3040000 },
  { id: "st-3", userId: "user-1", period: "2026-Q3", targetAmount: 10000000, achievedAmount: 7240000 },
];

export function createSeedState(): CRMState {
  return {
    customers: mockCustomers,
    contacts: mockContacts,
    deals: mockDeals,
    emails: mockEmailThreads,
    purchaseOrders: mockPurchaseOrders,
    followUps: mockFollowUps,
    workflows: mockWorkflows,
    users: mockUsers,
    notifications: seedNotifications,
    activities: mockActivities,
    salesTargets: seedSalesTargets,
    settings: defaultSettings,
    currentUserId: "user-1",
  };
}
