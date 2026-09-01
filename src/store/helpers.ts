import type {
  AutomationStep,
  Customer,
  Deal,
  DealStage,
  EntityStatus,
  FollowUpStatus,
  POStatus,
  Priority,
  User,
} from "@/types";
import type { CRMState } from "./types";

export function computeFollowUpStatus(
  dueDate: string,
  currentStatus: FollowUpStatus
): FollowUpStatus {
  if (currentStatus === "completed") return "completed";
  const due = new Date(dueDate);
  const now = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dueDay < today) return "overdue";
  if (dueDay.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export function enrichCustomer(customer: Customer, state: CRMState): Customer {
  const deals = state.deals.filter((d) => d.customerId === customer.id);
  const activeDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length;
  const revenue = deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + d.value, 0);
  const lastActivity = deals.reduce((latest, d) => {
    return d.lastActivity > latest ? d.lastActivity : latest;
  }, customer.lastActivity);

  return { ...customer, activeDeals, revenue, lastActivity };
}

export function enrichDeal(deal: Deal, state: CRMState): Deal {
  const emails = state.emails.filter((e) => e.dealId === deal.id);
  const pos = state.purchaseOrders.filter((p) => p.dealId === deal.id);
  const followUps = state.followUps.filter(
    (f) => f.dealId === deal.id && f.status !== "completed"
  );
  const pendingFollowUp = followUps.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  );

  let attentionReason = deal.attentionReason;
  let priority = deal.priority;

  if (!attentionReason && daysSinceActivity >= 5 && deal.stage !== "won" && deal.stage !== "lost") {
    attentionReason = `No response for ${daysSinceActivity} days`;
    priority = "high";
  }
  if (!attentionReason && pos.some((p) => p.status === "pending" || p.status === "received")) {
    attentionReason = "PO pending";
    priority = priority ?? "medium";
  }

  const pendingPo = pos.find((p) => ["pending", "received", "approved", "processing"].includes(p.status));

  return {
    ...deal,
    emailCount: emails.length,
    poStatus: pendingPo ? `${pos.length} PO` : pos.length > 0 ? "Completed" : undefined,
    followUpStatus: pendingFollowUp
      ? `Due ${new Date(pendingFollowUp.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
      : undefined,
    aiInsight:
      deal.aiInsight ??
      (deal.probability >= 70
        ? "High probability"
        : deal.probability >= 45
          ? "Moderate probability"
          : "Needs attention"),
    attentionReason,
    priority,
  };
}

export function getUserById(state: CRMState, id: string) {
  return state.users.find((u) => u.id === id);
}

export function filterByRole<T extends { ownerId?: string }>(
  items: T[],
  state: CRMState,
  userId: string
): T[] {
  const user = getUserById(state, userId);
  if (!user) return items;
  if (user.role === "admin" || user.role === "sales_manager") return items;
  if (user.role === "viewer" || user.role === "salesperson") {
    return items.filter((item) => !item.ownerId || item.ownerId === userId);
  }
  return items;
}

export function calculateDashboardMetrics(state: CRMState) {
  const wonDeals = state.deals.filter((d) => d.stage === "won");
  const activeDeals = state.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pendingPOs = state.purchaseOrders.filter((p) =>
    ["pending", "received", "approved", "processing"].includes(p.status)
  );
  const totalSales = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const targetAmount = state.salesTargets.reduce((sum, t) => sum + t.targetAmount, 0) || 10000000;
  const achieved = Math.min(100, Math.round((totalSales / targetAmount) * 100));

  return {
    totalSales,
    openDealsCount: activeDeals.length,
    pipelineValue,
    pendingPOCount: pendingPOs.length,
    pendingPOValue: pendingPOs.reduce((sum, p) => sum + p.amount, 0),
    targetAmount,
    achievedPercent: achieved,
    wonCount: wonDeals.length,
    lostCount: state.deals.filter((d) => d.stage === "lost").length,
    avgDealValue:
      state.deals.length > 0
        ? Math.round(state.deals.reduce((s, d) => s + d.value, 0) / state.deals.length)
        : 0,
    winRate:
      wonDeals.length + state.deals.filter((d) => d.stage === "lost").length > 0
        ? Math.round(
            (wonDeals.length /
              (wonDeals.length + state.deals.filter((d) => d.stage === "lost").length)) *
              100
          )
        : 0,
    followUpCompletion:
      state.followUps.length > 0
        ? Math.round(
            (state.followUps.filter((f) => f.status === "completed").length /
              state.followUps.length) *
              100
          )
        : 100,
  };
}

export function getPipelineData(state: CRMState) {
  const stages: DealStage[] = ["new", "qualified", "quotation", "negotiation", "won"];
  const labels: Record<DealStage, string> = {
    new: "New Lead",
    qualified: "Qualified",
    quotation: "Quotation",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
  };
  return stages.map((stage) => {
    const stageDeals = state.deals.filter((d) => d.stage === stage);
    return {
      stage,
      label: labels[stage],
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
    };
  });
}

export function getAttentionDeals(state: CRMState): Deal[] {
  return state.deals
    .map((d) => enrichDeal(d, state))
    .filter((d) => d.attentionReason && d.stage !== "won" && d.stage !== "lost")
    .slice(0, 5);
}

export interface SearchResult {
  id: string;
  type: "customer" | "contact" | "deal" | "po" | "email";
  title: string;
  subtitle: string;
  status?: string;
  href: string;
}

export function globalSearch(state: CRMState, query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  state.customers.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.contactEmail.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        type: "customer",
        title: c.name,
        subtitle: c.location,
        status: c.status,
        href: `/customers/${c.id}`,
      });
    }
  });

  state.contacts.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        type: "contact",
        title: c.name,
        subtitle: c.company,
        status: c.status,
        href: `/contacts`,
      });
    }
  });

  state.deals.forEach((d) => {
    if (d.title.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q)) {
      results.push({
        id: d.id,
        type: "deal",
        title: d.title,
        subtitle: d.customerName,
        status: d.stage,
        href: `/deals/${d.id}`,
      });
    }
  });

  state.purchaseOrders.forEach((p) => {
    if (p.poNumber.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q)) {
      results.push({
        id: p.id,
        type: "po",
        title: p.poNumber,
        subtitle: p.customerName,
        status: p.status,
        href: `/purchase-orders/${p.id}`,
      });
    }
  });

  state.emails.forEach((e) => {
    if (e.subject.toLowerCase().includes(q) || e.from.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        type: "email",
        title: e.subject,
        subtitle: e.from,
        status: e.folder,
        href: `/inbox`,
      });
    }
  });

  return results.slice(0, 12);
}

export type CreateCustomerInput = {
  name: string;
  industry: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  ownerId: string;
  status: EntityStatus;
};

export type CreateContactInput = {
  name: string;
  companyId: string;
  designation: string;
  email: string;
  phone: string;
  ownerId: string;
  status: EntityStatus;
};

export type CreateDealInput = {
  customerId: string;
  title: string;
  value: number;
  ownerId: string;
  stage: DealStage;
  probability: number;
  expectedClose: string;
};

export type CreateFollowUpInput = {
  customerId: string;
  dealId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority?: Priority;
  ownerId: string;
};

export type CreatePOInput = {
  poNumber: string;
  customerId: string;
  dealId: string;
  amount: number;
  poDate: string;
  deliveryDate: string;
  status: POStatus;
  ownerId: string;
  documentName?: string;
  documentSize?: number;
  documentType?: string;
};

export type ComposeEmailInput = {
  to: string;
  subject: string;
  body: string;
  customerId?: string;
  dealId?: string;
};

export type CreateWorkflowInput = {
  name: string;
  description: string;
  steps: Omit<AutomationStep, "id">[];
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: User["role"];
  department: string;
  status: EntityStatus;
};
