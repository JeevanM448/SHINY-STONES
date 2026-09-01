/**
 * Service layer registry — swap mock vs production without changing UI.
 *
 * Mock (default): in-memory store + localStorage via src/services/mock/*
 * Production: Supabase/API via src/services/supabase/* (stubs until backend phases complete)
 */
import { getServiceMode } from "./config";
import type {
  ActivityService,
  AIService,
  AuthService,
  AutomationService,
  ContactService,
  CustomerService,
  DashboardService,
  DealService,
  EmailService,
  FollowUpService,
  NotificationService,
  PurchaseOrderService,
  ReportService,
  SettingsService,
  UserService,
} from "./interfaces";
import { MockAIService } from "./mock/aiServiceAdapter";
import { MockActivityService } from "./mock/activityService";
import { MockAuthService } from "./mock/authService";
import {
  MockDashboardService,
  MockReportService,
  MockSettingsService,
} from "./mock/aggregatedServices";
import * as automation from "./mock/automationService";
import * as contacts from "./mock/contactService";
import * as customers from "./mock/customerService";
import * as deals from "./mock/dealService";
import * as emails from "./mock/emailService";
import * as followUps from "./mock/followUpService";
import * as notifications from "./mock/notificationService";
import * as purchaseOrders from "./mock/poService";
import * as users from "./mock/userService";
import {
  supabaseActivityService,
  supabaseAIService,
  supabaseAuthService,
  supabaseAutomationService,
  supabaseContactService,
  supabaseCustomerService,
  supabaseDashboardService,
  supabaseDealService,
  supabaseEmailService,
  supabaseFollowUpService,
  supabaseNotificationService,
  supabasePurchaseOrderService,
  supabaseReportService,
  supabaseSettingsService,
  supabaseUserService,
} from "./supabase/stubServices";

export { getServiceMode, isMockMode, isProductionMode } from "./config";
export type * from "./interfaces";
export type * from "./types";

// --- Mock implementations ---

export class MockCustomerService implements CustomerService {
  getCustomers = customers.getCustomers;
  getCustomer = customers.getCustomer;
  createCustomer = customers.createCustomer;
  updateCustomer = customers.updateCustomer;
  deleteCustomer = customers.deleteCustomer;
}

export class MockContactService implements ContactService {
  getContacts = contacts.getContacts;
  getContact = contacts.getContact;
  createContact = contacts.createContact;
  updateContact = contacts.updateContact;
  deleteContact = contacts.deleteContact;
}

export class MockDealService implements DealService {
  getDeals = deals.getDeals;
  getDeal = deals.getDeal;
  getDealsByCustomer = deals.getDealsByCustomer;
  createDeal = deals.createDeal;
  updateDeal = deals.updateDeal;
  updateDealStage = deals.updateDealStage;
  deleteDeal = deals.deleteDeal;
}

export class MockEmailService implements EmailService {
  getEmails = emails.getEmails;
  getEmail = emails.getEmail;
  sendEmail = emails.sendEmail;
  saveDraft = emails.saveDraft;
  deleteEmail = emails.deleteEmail;
  markEmailRead = emails.markEmailRead;
  linkEmailToDeal = emails.linkEmailToDeal;
}

export class MockPurchaseOrderService implements PurchaseOrderService {
  getPurchaseOrders = purchaseOrders.getPurchaseOrders;
  getPurchaseOrder = purchaseOrders.getPurchaseOrder;
  createPurchaseOrder = purchaseOrders.createPurchaseOrder;
  updatePurchaseOrder = purchaseOrders.updatePurchaseOrder;
  deletePurchaseOrder = purchaseOrders.deletePurchaseOrder;
}

export class MockFollowUpService implements FollowUpService {
  getFollowUps = followUps.getFollowUps;
  getFollowUpsByDeal = followUps.getFollowUpsByDeal;
  createFollowUp = followUps.createFollowUp;
  updateFollowUp = followUps.updateFollowUp;
  completeFollowUp = followUps.completeFollowUp;
  rescheduleFollowUp = followUps.rescheduleFollowUp;
  deleteFollowUp = followUps.deleteFollowUp;
}

export class MockAutomationService implements AutomationService {
  getWorkflows = automation.getWorkflows;
  createWorkflow = automation.createWorkflow;
  updateWorkflow = automation.updateWorkflow;
  deleteWorkflow = automation.deleteWorkflow;
  toggleWorkflow = automation.toggleWorkflow;
  runWorkflow = automation.runWorkflow;
}

export class MockNotificationService implements NotificationService {
  getNotifications = notifications.getNotifications;
  getUnreadCount = notifications.getUnreadCount;
  markRead = notifications.markRead;
  markAllRead = notifications.markAllRead;
}

export class MockUserService implements UserService {
  getUsers = users.getUsers;
  createUser = users.createUser;
  updateUser = users.updateUser;
  deactivateUser = users.deactivateUser;
}

const mockServices: {
  customer: CustomerService;
  contact: ContactService;
  deal: DealService;
  email: EmailService;
  purchaseOrder: PurchaseOrderService;
  followUp: FollowUpService;
  automation: AutomationService;
  notification: NotificationService;
  user: UserService;
  settings: SettingsService;
  dashboard: DashboardService;
  report: ReportService;
  activity: ActivityService;
  auth: AuthService;
  ai: AIService;
} = {
  customer: new MockCustomerService(),
  contact: new MockContactService(),
  deal: new MockDealService(),
  email: new MockEmailService(),
  purchaseOrder: new MockPurchaseOrderService(),
  followUp: new MockFollowUpService(),
  automation: new MockAutomationService(),
  notification: new MockNotificationService(),
  user: new MockUserService(),
  settings: new MockSettingsService(),
  dashboard: new MockDashboardService(),
  report: new MockReportService(),
  activity: new MockActivityService(),
  auth: new MockAuthService(),
  ai: new MockAIService(),
} as const;

const productionServices: typeof mockServices = {
  customer: supabaseCustomerService,
  contact: supabaseContactService,
  deal: supabaseDealService,
  email: supabaseEmailService,
  purchaseOrder: supabasePurchaseOrderService,
  followUp: supabaseFollowUpService,
  automation: supabaseAutomationService,
  notification: supabaseNotificationService,
  user: supabaseUserService,
  settings: supabaseSettingsService,
  dashboard: supabaseDashboardService,
  report: supabaseReportService,
  activity: supabaseActivityService,
  auth: supabaseAuthService,
  ai: supabaseAIService,
} as const;

function resolveServices() {
  return getServiceMode() === "production" ? productionServices : mockServices;
}

export const services = resolveServices();

export const customerService = services.customer;
export const contactService = services.contact;
export const dealService = services.deal;
export const emailService = services.email;
export const purchaseOrderService = services.purchaseOrder;
export const followUpService = services.followUp;
export const automationService = services.automation;
export const notificationService = services.notification;
export const userService = services.user;
export const settingsService = services.settings;
export const dashboardService = services.dashboard;
export const reportService = services.report;
export const activityService = services.activity;
export const authService = services.auth;
export const aiService = services.ai;
