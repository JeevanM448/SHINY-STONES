import type { EmailThread } from "@/types";
import type { AIService } from "../interfaces";
import {
  classifyEmail,
  summarizeEmail,
  generateReply,
  recommendFollowUp,
  extractPOFields,
  getDealInsight,
} from "./aiService";

async function wrap<T>(fn: () => T): Promise<T> {
  return fn();
}

export class MockAIService implements AIService {
  classifyEmail = (email: Pick<EmailThread, "subject" | "preview" | "messages">) =>
    wrap(() => classifyEmail(email));
  summarizeEmail = (email: Pick<EmailThread, "subject" | "preview" | "messages">) =>
    wrap(() => summarizeEmail(email));
  generateReply = (
    email: Pick<EmailThread, "from" | "subject" | "messages" | "aiIntent">,
    senderName?: string
  ) => wrap(() => generateReply(email, senderName));
  recommendFollowUp = (email: Pick<EmailThread, "subject" | "preview" | "messages">) =>
    wrap(() => recommendFollowUp(email));
  extractPOFields = (input: {
    poNumber?: string;
    customerName?: string;
    amount?: number;
    deliveryDate?: string;
    items?: { name: string; quantity: number; unitPrice: number }[];
  }) => wrap(() => extractPOFields(input));
  getDealInsight = (deal: {
    probability: number;
    lastActivity: string;
    stage: string;
    attentionReason?: string;
  }) => wrap(() => getDealInsight(deal));
}
