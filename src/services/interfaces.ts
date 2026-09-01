import type {
  Activity,
  AutomationWorkflow,
  Contact,
  Customer,
  Deal,
  DealStage,
  EmailThread,
  FollowUp,
  PurchaseOrder,
  User,
} from "@/types";
import type { AppSettings } from "@/store/types";
import type {
  CreateCustomerInput,
  CreateContactInput,
  CreateDealInput,
  CreateFollowUpInput,
  CreatePOInput,
  ComposeEmailInput,
  CreateWorkflowInput,
  CreateUserInput,
  SearchResult,
} from "@/store/helpers";
import type {
  ActivityFilters,
  AIClassification,
  AuthSession,
  DashboardMetrics,
  DealInsight,
  PipelineStageSummary,
  POExtractionResult,
  RevenueChartPoint,
  TeamPerformanceRow,
} from "./types";

export interface CustomerService {
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer>;
  createCustomer(data: CreateCustomerInput): Promise<Customer>;
  updateCustomer(id: string, data: Partial<CreateCustomerInput>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
}

export interface ContactService {
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact>;
  createContact(data: CreateContactInput): Promise<Contact>;
  updateContact(id: string, data: Partial<CreateContactInput>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
}

export interface DealService {
  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal>;
  getDealsByCustomer(customerId: string): Promise<Deal[]>;
  createDeal(data: CreateDealInput): Promise<Deal>;
  updateDeal(id: string, data: Partial<CreateDealInput>): Promise<Deal>;
  updateDealStage(id: string, stage: DealStage): Promise<Deal>;
  deleteDeal(id: string): Promise<void>;
}

export interface EmailService {
  getEmails(folder?: EmailThread["folder"] | "important"): Promise<EmailThread[]>;
  getEmail(id: string): Promise<EmailThread>;
  sendEmail(data: ComposeEmailInput): Promise<EmailThread>;
  saveDraft(data: ComposeEmailInput): Promise<EmailThread>;
  deleteEmail(id: string): Promise<void>;
  markEmailRead(id: string): Promise<void>;
  linkEmailToDeal(emailId: string, dealId: string): Promise<void>;
}

export interface PurchaseOrderService {
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder>;
  createPurchaseOrder(data: CreatePOInput): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, data: Partial<CreatePOInput>): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;
}

export interface FollowUpService {
  getFollowUps(): Promise<FollowUp[]>;
  getFollowUpsByDeal(dealId: string): Promise<FollowUp[]>;
  createFollowUp(data: CreateFollowUpInput): Promise<FollowUp>;
  updateFollowUp(id: string, data: Partial<CreateFollowUpInput>): Promise<FollowUp>;
  completeFollowUp(id: string): Promise<void>;
  rescheduleFollowUp(id: string, dueDate: string): Promise<void>;
  deleteFollowUp(id: string): Promise<void>;
}

export interface AutomationService {
  getWorkflows(): Promise<AutomationWorkflow[]>;
  createWorkflow(data: CreateWorkflowInput): Promise<AutomationWorkflow>;
  updateWorkflow(id: string, data: Partial<CreateWorkflowInput & { active?: boolean }>): Promise<AutomationWorkflow>;
  deleteWorkflow(id: string): Promise<void>;
  toggleWorkflow(id: string): Promise<void>;
  runWorkflow(id: string): Promise<string[]>;
}

export interface NotificationService {
  getNotifications(): Promise<import("@/store/types").AppNotification[]>;
  getUnreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

export interface UserService {
  getUsers(): Promise<User[]>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: Partial<CreateUserInput>): Promise<User>;
  deactivateUser(id: string): Promise<void>;
}

export interface SettingsService {
  getSettings(): Promise<AppSettings>;
  updateSettings(data: Partial<AppSettings>): Promise<void>;
  resetDemoData(): Promise<void>;
  exportDemoData(): Promise<Record<string, unknown>>;
  search(query: string): Promise<SearchResult[]>;
}

export interface DashboardService {
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getPipeline(): Promise<PipelineStageSummary[]>;
  getAttentionDeals(): Promise<Deal[]>;
  getActivities(filters?: ActivityFilters): Promise<Activity[]>;
  getTeamPerformance(): Promise<TeamPerformanceRow[]>;
  getRevenueChartData(): Promise<RevenueChartPoint[]>;
}

export interface ReportService {
  getReportMetrics(): Promise<DashboardMetrics>;
  getTeamPerformance(): Promise<TeamPerformanceRow[]>;
  getRevenueChartData(): Promise<RevenueChartPoint[]>;
  getPipeline(): Promise<PipelineStageSummary[]>;
}

export interface ActivityService {
  getActivities(filters?: ActivityFilters): Promise<Activity[]>;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<User | null>;
}

export interface AIService {
  classifyEmail(
    email: Pick<EmailThread, "subject" | "preview" | "messages">
  ): Promise<AIClassification>;
  summarizeEmail(
    email: Pick<EmailThread, "subject" | "preview" | "messages">
  ): Promise<string>;
  generateReply(
    email: Pick<EmailThread, "from" | "subject" | "messages" | "aiIntent">,
    senderName?: string
  ): Promise<string>;
  recommendFollowUp(
    email: Pick<EmailThread, "subject" | "preview" | "messages">
  ): Promise<{ title: string; priority: "low" | "medium" | "high" }>;
  extractPOFields(input: {
    poNumber?: string;
    customerName?: string;
    amount?: number;
    deliveryDate?: string;
    items?: { name: string; quantity: number; unitPrice: number }[];
  }): Promise<POExtractionResult>;
  getDealInsight(deal: {
    probability: number;
    lastActivity: string;
    stage: string;
    attentionReason?: string;
  }): Promise<DealInsight>;
}

export type {
  Activity,
  Contact,
  FollowUp,
  PurchaseOrder,
  User,
  AutomationWorkflow,
  CreateContactInput,
  CreateFollowUpInput,
  CreatePOInput,
  CreateWorkflowInput,
  CreateUserInput,
  AIClassification,
  AuthSession,
  DashboardMetrics,
  DealInsight,
  POExtractionResult,
};
