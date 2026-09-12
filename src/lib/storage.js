import { addDoc, collection, getDocs } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase";
import { initialData } from "@/lib/data";

export const storageMode = firebaseEnabled && db ? "firebase" : "local";
export async function loadRemoteData() {
  if (storageMode !== "firebase") return null;
  const records = await Promise.all(Object.keys(initialData).map(async (name) => [name, (await getDocs(collection(db, name))).docs.map((item) => ({ id: item.id, ...item.data() }))]));
  return Object.fromEntries(records.filter(([, items]) => items.length));
}
export async function persistEntity(name, record) {
  if (storageMode === "firebase") return addDoc(collection(db, name), record);
  return { id: record.id, ...record };
}