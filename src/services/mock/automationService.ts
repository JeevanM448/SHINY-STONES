import { delay } from "@/store/storage";
import * as store from "@/store/crmStore";

export async function getWorkflows() {
  await delay();
  return store.getWorkflows();
}

export async function createWorkflow(data: Parameters<typeof store.createWorkflow>[0]) {
  await delay();
  return store.createWorkflow(data);
}

export async function updateWorkflow(id: string, data: Parameters<typeof store.updateWorkflow>[1]) {
  await delay();
  return store.updateWorkflow(id, data);
}

export async function deleteWorkflow(id: string) {
  await delay();
  store.deleteWorkflow(id);
}

export async function toggleWorkflow(id: string) {
  await delay();
  store.toggleWorkflow(id);
}

export async function runWorkflow(id: string) {
  await delay(400);
  return store.runWorkflow(id);
}
