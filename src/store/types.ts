import type {
  Activity,
  AutomationWorkflow,
  Contact,
  Customer,
  Deal,
  EmailThread,
  FollowUp,
  PurchaseOrder,
  User,
} from "@/types";

export interface SalesTargetRecord {
  id: string;
  userId: string;
  period: string;
  targetAmount: number;
  achievedAmount: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "email" | "deal" | "follow-up" | "po" | "ai" | "system";
  read: boolean;
  timestamp: string;
  href?: string;
}

export interface AppSettings {
  aiEnabled: boolean;
  emailAutoLink: boolean;
  autoFollowUp: boolean;
  companyName: string;
  defaultCurrency: string;
  timezone: string;
}

export interface CRMState {
  customers: Customer[];
  contacts: Contact[];
  deals: Deal[];
  emails: EmailThread[];
  purchaseOrders: PurchaseOrder[];
  followUps: FollowUp[];
  workflows: AutomationWorkflow[];
  users: User[];
  notifications: AppNotification[];
  activities: Activity[];
  salesTargets: SalesTargetRecord[];
  settings: AppSettings;
  currentUserId: string;
}

export const defaultSettings: AppSettings = {
  aiEnabled: true,
  emailAutoLink: true,
  autoFollowUp: true,
  companyName: "Shiny Stone Industries",
  defaultCurrency: "INR",
  timezone: "Asia/Kolkata",
};
