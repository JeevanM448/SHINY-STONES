import type { Activity, Deal, DealStage, EmailThread, User } from "@/types";
import type { AppNotification } from "@/store/types";

/** Dashboard KPI aggregate — mirrors calculateDashboardMetrics() */
export interface DashboardMetrics {
  totalSales: number;
  openDealsCount: number;
  pipelineValue: number;
  pendingPOCount: number;
  pendingPOValue: number;
  targetAmount: number;
  achievedPercent: number;
  wonCount: number;
  lostCount: number;
  avgDealValue: number;
  winRate: number;
  followUpCompletion: number;
}

export interface PipelineStageSummary {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
}

export interface TeamPerformanceRow {
  name: string;
  deals: number;
  revenue: number;
  target: number;
}

export interface RevenueChartPoint {
  month: string;
  revenue: number;
  target: number;
}

export interface ActivityFilters {
  customerId?: string;
  dealId?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  accessToken?: string;
}

export interface AIClassification {
  intent: string;
  priority: "low" | "medium" | "high";
  summary: string;
  suggestedAction: string;
}

export interface POExtractionResult {
  poNumber: string;
  customer: string;
  amount: number;
  deliveryDate: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  tax: number;
  total: number;
  confidence: number;
}

export interface DealInsight {
  probability: number;
  risk: string;
  recommendedAction: string;
}

export type { Activity, AppNotification, Deal, EmailThread, User };
