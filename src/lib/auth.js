import { initialData } from "@/lib/data";

export const DEMO_PASSWORD = "demo123";
export const demoUsers = initialData.users;

export function authenticateLocal(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = demoUsers.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
  if (!user) return { ok: false, message: "No SkillConnect account was found for that email." };
  if (password !== DEMO_PASSWORD) return { ok: false, message: "Incorrect password. Use the demo password or choose Demo Access." };
  return { ok: true, user };
}

export function getDemoUser(role) {
  return demoUsers.find((user) => user.role === role) || null;
}