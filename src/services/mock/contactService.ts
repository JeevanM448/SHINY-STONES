import { delay } from "@/store/storage";
import * as store from "@/store/crmStore";

export async function getContacts() {
  await delay();
  return store.getContacts();
}

export async function getContact(id: string) {
  await delay();
  const contact = store.getContacts().find((c) => c.id === id);
  if (!contact) throw new Error("Contact not found");
  return contact;
}

export async function getContactsByCustomer(customerId: string) {
  await delay();
  return store.getContactsByCustomer(customerId);
}

export async function createContact(data: Parameters<typeof store.createContact>[0]) {
  await delay();
  return store.createContact(data);
}

export async function updateContact(id: string, data: Parameters<typeof store.updateContact>[1]) {
  await delay();
  return store.updateContact(id, data);
}

export async function deleteContact(id: string) {
  await delay();
  store.deleteContact(id);
}
