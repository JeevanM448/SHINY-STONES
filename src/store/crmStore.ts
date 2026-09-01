import { createSeedState } from "@/data/mock/seed";
import type {
  Activity,
  AutomationWorkflow,
  Contact,
  Customer,
  Deal,
  DealStage,
  EmailThread,
  FollowUp,
  FollowUpStatus,
  PurchaseOrder,
  User,
} from "@/types";
import {
  clearAllStorage,
  exportAllStorage,
  generateId,
  isBrowser,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  STORAGE_VERSION,
} from "./storage";
import type { AppNotification, AppSettings, CRMState } from "./types";
import {
  calculateDashboardMetrics,
  computeFollowUpStatus,
  enrichCustomer,
  enrichDeal,
  getAttentionDeals,
  getPipelineData,
  getUserById,
  globalSearch,
  filterByRole,
  type ComposeEmailInput,
  type CreateContactInput,
  type CreateCustomerInput,
  type CreateDealInput,
  type CreateFollowUpInput,
  type CreatePOInput,
  type CreateUserInput,
  type CreateWorkflowInput,
  type SearchResult,
} from "./helpers";

let state: CRMState = createSeedState();
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist(current: CRMState) {
  if (!isBrowser()) return;
  saveToStorage(STORAGE_KEYS.version, STORAGE_VERSION);
  saveToStorage(STORAGE_KEYS.customers, current.customers);
  saveToStorage(STORAGE_KEYS.contacts, current.contacts);
  saveToStorage(STORAGE_KEYS.deals, current.deals);
  saveToStorage(STORAGE_KEYS.emails, current.emails);
  saveToStorage(STORAGE_KEYS.purchaseOrders, current.purchaseOrders);
  saveToStorage(STORAGE_KEYS.followUps, current.followUps);
  saveToStorage(STORAGE_KEYS.workflows, current.workflows);
  saveToStorage(STORAGE_KEYS.users, current.users);
  saveToStorage(STORAGE_KEYS.notifications, current.notifications);
  saveToStorage(STORAGE_KEYS.activities, current.activities);
  saveToStorage(STORAGE_KEYS.salesTargets, current.salesTargets);
  saveToStorage(STORAGE_KEYS.settings, current.settings);
  saveToStorage(STORAGE_KEYS.currentUserId, current.currentUserId);
}

function setState(updater: (prev: CRMState) => CRMState) {
  state = updater(state);
  persist(state);
  notify();
}

function addActivity(
  current: CRMState,
  activity: Omit<Activity, "id" | "timestamp"> & { timestamp?: string }
): Activity[] {
  const newActivity: Activity = {
    id: generateId("act"),
    timestamp: activity.timestamp ?? new Date().toISOString(),
    type: activity.type,
    title: activity.title,
    description: activity.description,
    entityType: activity.entityType,
    entityId: activity.entityId,
    customerId: activity.customerId,
    dealId: activity.dealId,
    actorId: activity.actorId ?? current.currentUserId,
  };
  return [newActivity, ...current.activities].slice(0, 100);
}

function addNotification(
  current: CRMState,
  notification: Omit<AppNotification, "id" | "timestamp" | "read">
): AppNotification[] {
  const item: AppNotification = {
    id: generateId("notif"),
    read: false,
    timestamp: new Date().toISOString(),
    ...notification,
  };
  return [item, ...current.notifications].slice(0, 50);
}

function refreshFollowUpStatuses(followUps: FollowUp[]): FollowUp[] {
  return followUps.map((f) => ({
    ...f,
    status: computeFollowUpStatus(f.dueDate, f.status),
  }));
}

function touchCustomerLastActivity(customers: Customer[], customerId?: string): Customer[] {
  if (!customerId) return customers;
  const ts = new Date().toISOString();
  return customers.map((c) => (c.id === customerId ? { ...c, lastActivity: ts } : c));
}

function touchDealLastActivity(deals: Deal[], dealId?: string): Deal[] {
  if (!dealId) return deals;
  const ts = new Date().toISOString();
  return deals.map((d) => (d.id === dealId ? { ...d, lastActivity: ts } : d));
}

function recalculateSalesTargets(current: CRMState) {
  return current.salesTargets.map((target) => ({
    ...target,
    achievedAmount: current.deals
      .filter((d) => d.ownerId === target.userId && d.stage === "won")
      .reduce((sum, d) => sum + d.value, 0),
  }));
}

export function initStore() {
  if (initialized) return;
  initialized = true;

  if (!isBrowser()) {
    state = createSeedState();
    return;
  }

  const version = loadFromStorage<number | null>(STORAGE_KEYS.version, null);
  if (version !== STORAGE_VERSION) {
    state = createSeedState();
    persist(state);
    return;
  }

  const seed = createSeedState();
  state = {
    customers: loadFromStorage(STORAGE_KEYS.customers, seed.customers),
    contacts: loadFromStorage(STORAGE_KEYS.contacts, seed.contacts),
    deals: loadFromStorage(STORAGE_KEYS.deals, seed.deals),
    emails: loadFromStorage(STORAGE_KEYS.emails, seed.emails),
    purchaseOrders: loadFromStorage(STORAGE_KEYS.purchaseOrders, seed.purchaseOrders),
    followUps: refreshFollowUpStatuses(loadFromStorage(STORAGE_KEYS.followUps, seed.followUps)),
    workflows: loadFromStorage(STORAGE_KEYS.workflows, seed.workflows),
    users: loadFromStorage(STORAGE_KEYS.users, seed.users),
    notifications: loadFromStorage(STORAGE_KEYS.notifications, seed.notifications),
    activities: loadFromStorage(STORAGE_KEYS.activities, seed.activities),
    salesTargets: loadFromStorage(STORAGE_KEYS.salesTargets, seed.salesTargets),
    settings: loadFromStorage(STORAGE_KEYS.settings, seed.settings),
    currentUserId: loadFromStorage(STORAGE_KEYS.currentUserId, seed.currentUserId),
  };
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): CRMState {
  return state;
}

export function resetStore() {
  state = createSeedState();
  clearAllStorage();
  persist(state);
  notify();
}

export function exportStoreData() {
  return exportAllStorage();
}

// --- Auth / User ---

export function getCurrentUser(): User | undefined {
  return getUserById(state, state.currentUserId);
}

export function setCurrentUser(userId: string) {
  setState((s) => ({ ...s, currentUserId: userId }));
}

export function getUsers() {
  return state.users;
}

export function createUser(input: CreateUserInput): User {
  const user: User = {
    id: generateId("user"),
    name: input.name,
    email: input.email,
    role: input.role,
    department: input.department,
    status: input.status,
    lastActive: new Date().toISOString(),
  };
  setState((s) => ({
    ...s,
    users: [...s.users, user],
    activities: addActivity(s, {
      type: "system",
      title: `User created: ${user.name}`,
      entityType: "user",
      entityId: user.id,
    }),
  }));
  return user;
}

export function updateUser(id: string, data: Partial<CreateUserInput>): User {
  let updated!: User;
  setState((s) => ({
    ...s,
    users: s.users.map((u) => {
      if (u.id !== id) return u;
      updated = { ...u, ...data, lastActive: new Date().toISOString() };
      return updated;
    }),
  }));
  return updated;
}

export function deactivateUser(id: string) {
  updateUser(id, { status: "inactive" });
}

// --- Customers ---

export function getCustomers(): Customer[] {
  return state.customers
    .map((c) => enrichCustomer(c, state))
    .filter((c) => {
      const user = getCurrentUser();
      if (!user || user.role === "admin" || user.role === "sales_manager") return true;
      if (user.role === "viewer") return true;
      return c.ownerId === user.id;
    });
}

export function getCustomer(id: string): Customer | undefined {
  const customer = state.customers.find((c) => c.id === id);
  return customer ? enrichCustomer(customer, state) : undefined;
}

export function createCustomer(input: CreateCustomerInput): Customer {
  const owner = getUserById(state, input.ownerId);
  const customer: Customer = {
    id: generateId("cust"),
    name: input.name,
    industry: input.industry,
    location: input.location,
    owner: owner?.name ?? "Unassigned",
    ownerId: input.ownerId,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    activeDeals: 0,
    revenue: 0,
    lastActivity: new Date().toISOString(),
    status: input.status,
  };
  setState((s) => ({
    ...s,
    customers: [...s.customers, customer],
    activities: addActivity(s, {
      type: "customer",
      title: `Customer created: ${customer.name}`,
      customerId: customer.id,
      entityType: "customer",
      entityId: customer.id,
    }),
    notifications: addNotification(s, {
      userId: s.currentUserId,
      title: "Customer created",
      message: `${customer.name} added to CRM`,
      type: "system",
      href: `/customers/${customer.id}`,
    }),
  }));
  return enrichCustomer(customer, getSnapshot());
}

export function updateCustomer(id: string, data: Partial<CreateCustomerInput>): Customer {
  let updated!: Customer;
  setState((s) => ({
    ...s,
    customers: s.customers.map((c) => {
      if (c.id !== id) return c;
      const owner = data.ownerId ? getUserById(s, data.ownerId) : undefined;
      updated = {
        ...c,
        ...data,
        owner: owner?.name ?? c.owner,
        ownerId: data.ownerId ?? c.ownerId,
        lastActivity: new Date().toISOString(),
      };
      return updated;
    }),
    activities: addActivity(s, {
      type: "customer",
      title: `Customer updated: ${data.name ?? id}`,
      customerId: id,
      entityType: "customer",
      entityId: id,
    }),
  }));
  return enrichCustomer(updated, getSnapshot());
}

export function deleteCustomer(id: string) {
  setState((s) => ({
    ...s,
    customers: s.customers.filter((c) => c.id !== id),
    contacts: s.contacts.filter((c) => c.companyId !== id),
    activities: addActivity(s, {
      type: "customer",
      title: "Customer deleted",
      entityType: "customer",
      entityId: id,
    }),
  }));
}

// --- Contacts ---

export function getContacts(): Contact[] {
  return filterByRole(state.contacts, state, state.currentUserId);
}

export function getContactsByCustomer(customerId: string) {
  return state.contacts.filter((c) => c.companyId === customerId);
}

export function createContact(input: CreateContactInput): Contact {
  const customer = state.customers.find((c) => c.id === input.companyId);
  const owner = getUserById(state, input.ownerId);
  const contact: Contact = {
    id: generateId("cont"),
    name: input.name,
    company: customer?.name ?? "",
    companyId: input.companyId,
    designation: input.designation,
    email: input.email,
    phone: input.phone,
    owner: owner?.name ?? "",
    ownerId: input.ownerId,
    lastContact: new Date().toISOString(),
    status: input.status,
  };
  setState((s) => ({
    ...s,
    contacts: [...s.contacts, contact],
    activities: addActivity(s, {
      type: "contact",
      title: `Contact created: ${contact.name}`,
      customerId: input.companyId,
      entityType: "contact",
      entityId: contact.id,
    }),
  }));
  return contact;
}

export function updateContact(id: string, data: Partial<CreateContactInput>): Contact {
  let updated!: Contact;
  setState((s) => ({
    ...s,
    contacts: s.contacts.map((c) => {
      if (c.id !== id) return c;
      const customer = data.companyId
        ? s.customers.find((x) => x.id === data.companyId)
        : undefined;
      const owner = data.ownerId ? getUserById(s, data.ownerId) : undefined;
      updated = {
        ...c,
        ...data,
        company: customer?.name ?? c.company,
        companyId: data.companyId ?? c.companyId,
        owner: owner?.name ?? c.owner,
        ownerId: data.ownerId ?? c.ownerId,
        lastContact: new Date().toISOString(),
      };
      return updated;
    }),
  }));
  return updated;
}

export function deleteContact(id: string) {
  setState((s) => ({
    ...s,
    contacts: s.contacts.filter((c) => c.id !== id),
  }));
}

// --- Deals ---

export function getDeals(): Deal[] {
  return filterByRole(state.deals, state, state.currentUserId).map((d) =>
    enrichDeal(d, state)
  );
}

export function getDeal(id: string): Deal | undefined {
  const deal = state.deals.find((d) => d.id === id);
  return deal ? enrichDeal(deal, state) : undefined;
}

export function getDealsByCustomer(customerId: string) {
  return state.deals
    .filter((d) => d.customerId === customerId)
    .map((d) => enrichDeal(d, state));
}

export function createDeal(input: CreateDealInput): Deal {
  const customer = state.customers.find((c) => c.id === input.customerId);
  const owner = getUserById(state, input.ownerId);
  const deal: Deal = {
    id: generateId("deal"),
    title: input.title,
    customerId: input.customerId,
    customerName: customer?.name ?? "",
    owner: owner?.name ?? "",
    ownerId: input.ownerId,
    value: input.value,
    stage: input.stage,
    probability: input.probability,
    expectedClose: input.expectedClose,
    lastActivity: new Date().toISOString(),
    emailCount: 0,
  };
  setState((s) => ({
    ...s,
    deals: [...s.deals, deal],
    customers: touchCustomerLastActivity(s.customers, deal.customerId),
    activities: addActivity(s, {
      type: "deal",
      title: `Deal created: ${deal.title}`,
      description: `Stage: ${deal.stage}`,
      customerId: deal.customerId,
      dealId: deal.id,
      entityType: "deal",
      entityId: deal.id,
    }),
    notifications: addNotification(s, {
      userId: s.currentUserId,
      title: "Deal created",
      message: `${deal.title} for ${deal.customerName}`,
      type: "deal",
      href: `/deals/${deal.id}`,
    }),
  }));
  return enrichDeal(deal, getSnapshot());
}

export function updateDeal(id: string, data: Partial<CreateDealInput>): Deal {
  let updated!: Deal;
  setState((s) => ({
    ...s,
    deals: s.deals.map((d) => {
      if (d.id !== id) return d;
      const customer = data.customerId
        ? s.customers.find((c) => c.id === data.customerId)
        : undefined;
      const owner = data.ownerId ? getUserById(s, data.ownerId) : undefined;
      updated = {
        ...d,
        ...data,
        customerName: customer?.name ?? d.customerName,
        customerId: data.customerId ?? d.customerId,
        owner: owner?.name ?? d.owner,
        ownerId: data.ownerId ?? d.ownerId,
        lastActivity: new Date().toISOString(),
      };
      return updated;
    }),
    activities: addActivity(s, {
      type: "deal",
      title: `Deal updated: ${data.title ?? id}`,
      dealId: id,
      entityType: "deal",
      entityId: id,
    }),
  }));
  return enrichDeal(updated, getSnapshot());
}

export function updateDealStage(id: string, stage: DealStage): Deal {
  let updated!: Deal;
  setState((s) => {
    const deals = s.deals.map((d) => {
      if (d.id !== id) return d;
      updated = {
        ...d,
        stage,
        probability: stage === "won" ? 100 : stage === "lost" ? 0 : d.probability,
        lastActivity: new Date().toISOString(),
      };
      return updated;
    });
    const nextState = { ...s, deals };
    let notifications = addNotification(s, {
      userId: s.currentUserId,
      title: "Deal stage updated",
      message: `${updated.title} → ${stage}`,
      type: "deal",
      href: `/deals/${id}`,
    });
    if (stage === "won") {
      notifications = addNotification(
        { ...s, notifications },
        {
          userId: s.currentUserId,
          title: "Deal won",
          message: `${updated.title} closed successfully`,
          type: "deal",
          href: `/deals/${id}`,
        }
      );
    }
    return {
      ...nextState,
      customers: touchCustomerLastActivity(s.customers, updated.customerId),
      salesTargets: stage === "won" ? recalculateSalesTargets(nextState) : s.salesTargets,
      activities: addActivity(s, {
        type: "deal",
        title: `Deal moved to ${stage}`,
        description: updated?.title,
        dealId: id,
        customerId: updated?.customerId,
        entityType: "deal",
        entityId: id,
      }),
      notifications,
    };
  });
  return enrichDeal(updated, getSnapshot());
}

export function deleteDeal(id: string) {
  setState((s) => ({
    ...s,
    deals: s.deals.filter((d) => d.id !== id),
  }));
}

// --- Emails ---

export function getEmails(folder?: EmailThread["folder"] | "important") {
  let emails = [...state.emails];
  if (folder === "important") emails = emails.filter((e) => e.important);
  else if (folder) emails = emails.filter((e) => e.folder === folder);
  return emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEmail(id: string) {
  return state.emails.find((e) => e.id === id);
}

export function markEmailRead(id: string) {
  setState((s) => ({
    ...s,
    emails: s.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
  }));
}

export function sendEmail(input: ComposeEmailInput): EmailThread {
  const deal = input.dealId ? state.deals.find((d) => d.id === input.dealId) : undefined;
  const customerId = input.customerId ?? deal?.customerId;
  const customer = customerId
    ? state.customers.find((c) => c.id === customerId)
    : undefined;
  const user = getCurrentUser();
  const email: EmailThread = {
    id: generateId("email"),
    subject: input.subject,
    from: user?.name ?? "You",
    fromEmail: user?.email ?? "",
    preview: input.body.slice(0, 120),
    date: new Date().toISOString(),
    read: true,
    important: false,
    folder: "sent",
    customerId,
    customerName: customer?.name ?? deal?.customerName,
    dealId: input.dealId,
    dealTitle: deal?.title,
    messages: [
      {
        id: generateId("msg"),
        from: `${user?.name} <${user?.email}>`,
        to: input.to,
        date: new Date().toISOString(),
        body: input.body,
      },
    ],
  };
  setState((s) => ({
    ...s,
    emails: [email, ...s.emails],
    deals: touchDealLastActivity(s.deals, input.dealId),
    customers: touchCustomerLastActivity(s.customers, customerId),
    activities: addActivity(s, {
      type: "email",
      title: `Email sent: ${input.subject}`,
      customerId,
      dealId: input.dealId,
      entityType: "email",
      entityId: email.id,
    }),
  }));
  return email;
}

export function saveDraft(input: ComposeEmailInput): EmailThread {
  const draft: EmailThread = {
    id: generateId("email"),
    subject: input.subject || "(No subject)",
    from: getCurrentUser()?.name ?? "You",
    fromEmail: getCurrentUser()?.email ?? "",
    preview: input.body.slice(0, 120) || "Empty draft",
    date: new Date().toISOString(),
    read: true,
    important: false,
    folder: "drafts",
    customerId: input.customerId,
    dealId: input.dealId,
    messages: [
      {
        id: generateId("msg"),
        from: getCurrentUser()?.email ?? "",
        to: input.to,
        date: new Date().toISOString(),
        body: input.body,
      },
    ],
  };
  setState((s) => ({ ...s, emails: [draft, ...s.emails] }));
  return draft;
}

export function deleteEmail(id: string) {
  setState((s) => ({ ...s, emails: s.emails.filter((e) => e.id !== id) }));
}

export function linkEmailToDeal(emailId: string, dealId: string) {
  const deal = state.deals.find((d) => d.id === dealId);
  const email = state.emails.find((e) => e.id === emailId);
  setState((s) => ({
    ...s,
    emails: s.emails.map((e) =>
      e.id === emailId
        ? {
            ...e,
            dealId,
            dealTitle: deal?.title,
            customerId: deal?.customerId ?? e.customerId,
            customerName: deal?.customerName ?? e.customerName,
          }
        : e
    ),
    deals: touchDealLastActivity(s.deals, dealId),
    customers: touchCustomerLastActivity(s.customers, deal?.customerId),
    activities: addActivity(s, {
      type: "email",
      title: `Email linked to deal: ${email?.subject ?? "Message"}`,
      customerId: deal?.customerId,
      dealId,
      entityType: "email",
      entityId: emailId,
    }),
  }));
}

// --- Purchase Orders ---

export function getPurchaseOrders(): PurchaseOrder[] {
  return filterByRole(state.purchaseOrders, state, state.currentUserId);
}

export function getPurchaseOrder(id: string) {
  return state.purchaseOrders.find((p) => p.id === id);
}

export function getPOsByCustomer(customerId: string) {
  return state.purchaseOrders.filter((p) => p.customerId === customerId);
}

export function getPOsByDeal(dealId: string) {
  return state.purchaseOrders.filter((p) => p.dealId === dealId);
}

export function createPurchaseOrder(input: CreatePOInput): PurchaseOrder {
  const customer = state.customers.find((c) => c.id === input.customerId);
  const deal = state.deals.find((d) => d.id === input.dealId);
  const owner = getUserById(state, input.ownerId);
  const po: PurchaseOrder = {
    id: generateId("po"),
    poNumber: input.poNumber,
    customerId: input.customerId,
    customerName: customer?.name ?? "",
    dealId: input.dealId,
    dealTitle: deal?.title ?? "",
    amount: input.amount,
    poDate: input.poDate,
    deliveryDate: input.deliveryDate,
    status: input.status,
    owner: owner?.name ?? "",
    ownerId: input.ownerId,
    documentName: input.documentName,
    documentSize: input.documentSize,
    documentType: input.documentType,
    aiConfidence: 96,
    tax: Math.round(input.amount * 0.18),
    total: Math.round(input.amount * 1.18),
  };
  setState((s) => ({
    ...s,
    purchaseOrders: [...s.purchaseOrders, po],
    deals: touchDealLastActivity(s.deals, po.dealId),
    customers: touchCustomerLastActivity(s.customers, po.customerId),
    activities: addActivity(s, {
      type: "po",
      title: `PO uploaded: ${po.poNumber}`,
      customerId: po.customerId,
      dealId: po.dealId,
      entityType: "po",
      entityId: po.id,
    }),
    notifications: addNotification(s, {
      userId: s.currentUserId,
      title: "PO received",
      message: `${po.poNumber} from ${po.customerName}`,
      type: "po",
      href: `/purchase-orders/${po.id}`,
    }),
  }));
  return po;
}

export function updatePurchaseOrder(
  id: string,
  data: Partial<CreatePOInput & { items?: PurchaseOrder["items"]; tax?: number; total?: number; aiConfidence?: number }>
): PurchaseOrder {
  let updated!: PurchaseOrder;
  setState((s) => {
    const previous = s.purchaseOrders.find((p) => p.id === id);
    const purchaseOrders = s.purchaseOrders.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...data };
      return updated;
    });
    const approved = data.status === "approved" && previous?.status !== "approved";
    return {
      ...s,
      purchaseOrders,
      deals: touchDealLastActivity(s.deals, updated.dealId),
      customers: touchCustomerLastActivity(s.customers, updated.customerId),
      activities: addActivity(s, {
        type: "po",
        title: approved ? `PO approved: ${updated.poNumber}` : `PO updated: ${updated.poNumber}`,
        customerId: updated.customerId,
        dealId: updated.dealId,
        entityType: "po",
        entityId: id,
      }),
      notifications: approved
        ? addNotification(s, {
            userId: s.currentUserId,
            title: "PO approved",
            message: `${updated.poNumber} approved for ${updated.dealTitle}`,
            type: "po",
            href: `/purchase-orders/${id}`,
          })
        : s.notifications,
    };
  });
  return updated;
}

export function deletePurchaseOrder(id: string) {
  setState((s) => ({
    ...s,
    purchaseOrders: s.purchaseOrders.filter((p) => p.id !== id),
  }));
}

// --- Follow-ups ---

export function getFollowUps() {
  return refreshFollowUpStatuses(
    filterByRole(state.followUps, state, state.currentUserId)
  );
}

export function getFollowUpsByDeal(dealId: string) {
  return refreshFollowUpStatuses(state.followUps.filter((f) => f.dealId === dealId));
}

export function createFollowUp(input: CreateFollowUpInput): FollowUp {
  const customer = state.customers.find((c) => c.id === input.customerId);
  const deal = state.deals.find((d) => d.id === input.dealId);
  const owner = getUserById(state, input.ownerId);
  const followUp: FollowUp = {
    id: generateId("fu"),
    title: input.title,
    description: input.description,
    customerId: input.customerId,
    customerName: customer?.name ?? "",
    dealId: input.dealId,
    dealTitle: deal?.title ?? "",
    dueDate: input.dueDate,
    status: computeFollowUpStatus(input.dueDate, "upcoming"),
    priority: input.priority ?? "medium",
    owner: owner?.name ?? "",
    ownerId: input.ownerId,
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({
    ...s,
    followUps: [...s.followUps, followUp],
    deals: touchDealLastActivity(s.deals, followUp.dealId),
    customers: touchCustomerLastActivity(s.customers, followUp.customerId),
    activities: addActivity(s, {
      type: "follow-up",
      title: `Follow-up created: ${followUp.title}`,
      dealId: followUp.dealId,
      customerId: followUp.customerId,
      entityType: "follow-up",
      entityId: followUp.id,
    }),
  }));
  return followUp;
}

export function updateFollowUp(id: string, data: Partial<CreateFollowUpInput>): FollowUp {
  let updated!: FollowUp;
  setState((s) => ({
    ...s,
    followUps: s.followUps.map((f) => {
      if (f.id !== id) return f;
      updated = {
        ...f,
        ...data,
        status: data.dueDate
          ? computeFollowUpStatus(data.dueDate, f.status)
          : f.status,
      };
      return updated;
    }),
  }));
  return updated;
}

export function completeFollowUp(id: string) {
  const followUp = state.followUps.find((f) => f.id === id);
  setState((s) => ({
    ...s,
    followUps: s.followUps.map((f) =>
      f.id === id ? { ...f, status: "completed" as FollowUpStatus } : f
    ),
    deals: touchDealLastActivity(s.deals, followUp?.dealId),
    activities: addActivity(s, {
      type: "follow-up",
      title: "Follow-up completed",
      dealId: followUp?.dealId,
      customerId: followUp?.customerId,
      entityType: "follow-up",
      entityId: id,
    }),
  }));
}

export function rescheduleFollowUp(id: string, dueDate: string) {
  updateFollowUp(id, { dueDate });
}

export function deleteFollowUp(id: string) {
  setState((s) => ({
    ...s,
    followUps: s.followUps.filter((f) => f.id !== id),
  }));
}

// --- Workflows ---

export function getWorkflows() {
  return state.workflows;
}

export function createWorkflow(input: CreateWorkflowInput): AutomationWorkflow {
  const workflow: AutomationWorkflow = {
    id: generateId("wf"),
    name: input.name,
    description: input.description,
    active: true,
    steps: input.steps.map((s) => ({ ...s, id: generateId("step") })),
  };
  setState((s) => ({ ...s, workflows: [...s.workflows, workflow] }));
  return workflow;
}

export function updateWorkflow(
  id: string,
  data: Partial<CreateWorkflowInput & { active?: boolean }>
): AutomationWorkflow {
  let updated!: AutomationWorkflow;
  setState((s) => ({
    ...s,
    workflows: s.workflows.map((w) => {
      if (w.id !== id) return w;
      updated = {
        ...w,
        ...data,
        steps: data.steps
          ? data.steps.map((step) => ({ ...step, id: generateId("step") }))
          : w.steps,
        lastRun: w.lastRun,
      };
      return updated;
    }),
  }));
  return updated;
}

export function deleteWorkflow(id: string) {
  setState((s) => ({
    ...s,
    workflows: s.workflows.filter((w) => w.id !== id),
  }));
}

export function toggleWorkflow(id: string) {
  setState((s) => ({
    ...s,
    workflows: s.workflows.map((w) =>
      w.id === id ? { ...w, active: !w.active } : w
    ),
  }));
}

export function runWorkflow(id: string): string[] {
  const workflow = state.workflows.find((w) => w.id === id);
  if (!workflow) return ["Workflow not found"];
  const results = workflow.steps.map((step) => `✓ ${step.label}`);
  setState((s) => ({
    ...s,
    workflows: s.workflows.map((w) =>
      w.id === id ? { ...w, lastRun: new Date().toISOString() } : w
    ),
    activities: addActivity(s, {
      type: "automation",
      title: `Workflow executed: ${workflow.name}`,
      description: results.join(" → "),
    }),
    notifications: addNotification(s, {
      userId: s.currentUserId,
      title: "Workflow executed",
      message: workflow.name,
      type: "system",
      href: "/automation",
    }),
  }));
  return results;
}

// --- Activities ---

export function getActivities(filters?: { customerId?: string; dealId?: string }) {
  let activities = [...state.activities];
  if (filters?.customerId) {
    const customerDealIds = state.deals
      .filter((d) => d.customerId === filters.customerId)
      .map((d) => d.id);
    activities = activities.filter(
      (a) =>
        a.customerId === filters.customerId ||
        (a.dealId != null && customerDealIds.includes(a.dealId))
    );
  }
  if (filters?.dealId) {
    activities = activities.filter((a) => a.dealId === filters.dealId);
  }
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// --- Notifications ---

export function getNotifications() {
  return state.notifications
    .filter((n) => n.userId === state.currentUserId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getUnreadNotificationCount() {
  return getNotifications().filter((n) => !n.read).length;
}

export function markNotificationRead(id: string) {
  setState((s) => ({
    ...s,
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  }));
}

export function markAllNotificationsRead() {
  setState((s) => ({
    ...s,
    notifications: s.notifications.map((n) =>
      n.userId === s.currentUserId ? { ...n, read: true } : n
    ),
  }));
}

// --- Settings ---

export function getSettings(): AppSettings {
  return state.settings;
}

export function updateSettings(data: Partial<AppSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...data } }));
}

// --- Dashboard / Reports ---

export function getDashboardMetrics() {
  return calculateDashboardMetrics(state);
}

export function getPipeline() {
  return getPipelineData(state);
}

export function getAttentionDealsList() {
  return getAttentionDeals(state);
}

export function search(query: string): SearchResult[] {
  return globalSearch(state, query);
}

export function getTeamPerformance() {
  return state.users
    .filter((u) => u.role === "salesperson" || u.role === "sales_manager")
    .map((user) => {
      const target =
        state.salesTargets.find((t) => t.userId === user.id)?.targetAmount ?? 0;
      const revenue = state.deals
        .filter((d) => d.ownerId === user.id && d.stage === "won")
        .reduce((sum, d) => sum + d.value, 0);
      const deals = state.deals.filter((d) => d.ownerId === user.id).length;
      return { name: user.name, deals, revenue, target: target || 1 };
    });
}

export function getRevenueChartData() {
  const metrics = calculateDashboardMetrics(state);
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return months.map((month, i) => ({
    month,
    revenue: Math.round(metrics.totalSales * (0.5 + i * 0.1)),
    target: Math.round(metrics.targetAmount / 6),
  }));
}
