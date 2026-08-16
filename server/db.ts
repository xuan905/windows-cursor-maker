import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { CursorPromptHistory, InsertCursorPromptHistory, InsertUser, cursorPromptHistory, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listCursorPromptHistory(userId: number): Promise<CursorPromptHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cursorPromptHistory).where(eq(cursorPromptHistory.userId, userId)).orderBy(desc(cursorPromptHistory.createdAt));
}

export async function insertCursorPromptHistory(input: InsertCursorPromptHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(cursorPromptHistory).values(input);
  return Number(result[0].insertId);
}

export async function setCursorPromptFavorite(userId: number, id: number, isFavorite: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(cursorPromptHistory).set({ isFavorite }).where(and(eq(cursorPromptHistory.id, id), eq(cursorPromptHistory.userId, userId)));
  const rows = await db.select().from(cursorPromptHistory).where(eq(cursorPromptHistory.userId, userId));
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteCursorPromptHistory(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(cursorPromptHistory).where(and(eq(cursorPromptHistory.id, id), eq(cursorPromptHistory.userId, userId)));
  return true;
}
