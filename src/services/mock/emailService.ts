import { delay } from "@/store/storage";
import * as store from "@/store/crmStore";
import type { EmailThread } from "@/types";

export async function getEmails(folder?: EmailThread["folder"] | "important") {
  await delay();
  return store.getEmails(folder);
}

export async function getEmail(id: string) {
  await delay();
  const email = store.getEmail(id);
  if (!email) throw new Error("Email not found");
  return email;
}

export async function sendEmail(data: Parameters<typeof store.sendEmail>[0]) {
  await delay(300);
  return store.sendEmail(data);
}

export async function saveDraft(data: Parameters<typeof store.saveDraft>[0]) {
  await delay();
  return store.saveDraft(data);
}

export async function deleteEmail(id: string) {
  await delay();
  store.deleteEmail(id);
}

export async function markEmailRead(id: string) {
  await delay();
  store.markEmailRead(id);
}

export async function linkEmailToDeal(emailId: string, dealId: string) {
  await delay();
  store.linkEmailToDeal(emailId, dealId);
}
