import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db, firebaseEnabled } from "@/lib/firebase";
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

async function getFirebaseProfile(firebaseUser) {
  if (!db) return null;
  const profileSnapshot = await getDocs(query(collection(db, "users"), where("email", "==", firebaseUser.email.toLowerCase())));
  const profile = profileSnapshot.docs[0];
  return profile ? { id: profile.id, ...profile.data(), email: firebaseUser.email } : null;
}

export async function authenticateUser(email, password) {
  if (!firebaseEnabled || !auth) return { ...authenticateLocal(email, password), source: "local" };

  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const user = await getFirebaseProfile(credential.user);
    if (!user?.role) {
      await signOut(auth);
      return { ok: false, message: "Your Firebase account is missing a SkillConnect profile in the users collection." };
    }
    return { ok: true, user, source: "firebase" };
  } catch (error) {
    const messages = {
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/user-disabled": "This Firebase account has been disabled.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
    };
    return { ok: false, message: messages[error.code] || "Firebase sign-in failed. Check your Firebase Auth setup." };
  }
}

export function subscribeToAuth(callback) {
  if (!firebaseEnabled || !auth) return () => {};
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    try {
      callback(await getFirebaseProfile(firebaseUser));
    } catch {
      callback(null);
    }
  });
}

export function logoutUser() {
  return auth ? signOut(auth) : Promise.resolve();
}

export function getDemoUser(role) {
  return demoUsers.find((user) => user.role === role) || null;
}