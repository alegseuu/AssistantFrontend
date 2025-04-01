// src/utils/sessionStorage.ts

import { openDB } from "idb";

const DB_NAME = "dapp-session";
const STORE_NAME = "session";
const KEY = "current";

export interface SessionData {
  accountId: string;
  privateKey: string;
  topicId: string;
  // Add more fields as needed
}

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function saveSession(data: SessionData) {
  const db = await getDb();
  await db.put(STORE_NAME, data, KEY);
}

export async function loadSession(): Promise<SessionData | null> {
  const db = await getDb();
  return (await db.get(STORE_NAME, KEY)) || null;
}

export async function clearSession() {
  const db = await getDb();
  await db.delete(STORE_NAME, KEY);
}
