/**
 * Service layer — swap mock implementations for Supabase/API later without changing UI.
 */
import type {
  AutomationService,
  ContactService,
  CustomerService,
  DealService,
  EmailService,
  FollowUpService,
  NotificationService,
  PurchaseOrderService,
  UserService,
} from "./interfaces";
import * as automation from "./mock/automationService";
import * as contacts from "./mock/contactService";
import * as customers from "./mock/customerService";
import * as deals from "./mock/dealService";
import * as emails from "./mock/emailService";
import * as followUps from "./mock/followUpService";
import * as notifications from "./mock/notificationService";
import * as purchaseOrders from "./mock/poService";
import * as users from "./mock/userService";

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

export const customerService: CustomerService = new MockCustomerService();
export const contactService: ContactService = new MockContactService();
export const dealService: DealService = new MockDealService();
export const emailService: EmailService = new MockEmailService();
export const purchaseOrderService: PurchaseOrderService = new MockPurchaseOrderService();
export const followUpService: FollowUpService = new MockFollowUpService();
export const automationService: AutomationService = new MockAutomationService();
export const notificationService: NotificationService = new MockNotificationService();
export const userService: UserService = new MockUserService();

export const services = {
  customer: customerService,
  contact: contactService,
  deal: dealService,
  email: emailService,
  purchaseOrder: purchaseOrderService,
  followUp: followUpService,
  automation: automationService,
  notification: notificationService,
  user: userService,
};
