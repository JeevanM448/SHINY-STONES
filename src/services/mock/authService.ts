import { delay } from "@/store/storage";
import * as store from "@/store/crmStore";
import type { AuthService } from "../interfaces";

export async function signIn(email: string, password: string) {
  await delay(200);
  void password;
  const user = store.getUsers().find((u) => u.email === email) ?? store.getCurrentUser();
  if (!user) throw new Error("Invalid credentials (mock)");
  store.setCurrentUser(user.id);
  return { userId: user.id, email: user.email };
}

export async function signOut() {
  await delay();
  // Mock: remain on last user id; production will clear session
}

export async function getSession() {
  await delay();
  const user = store.getCurrentUser();
  if (!user) return null;
  return { userId: user.id, email: user.email };
}

export async function getCurrentUser() {
  await delay();
  return store.getCurrentUser() ?? null;
}

export class MockAuthService implements AuthService {
  signIn = signIn;
  signOut = signOut;
  getSession = getSession;
  getCurrentUser = getCurrentUser;
}
