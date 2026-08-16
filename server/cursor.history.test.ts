import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type HistoryRow = {
  id: number;
  userId: number;
  title: string;
  imageUrl: string;
  prompt: string;
  appearanceJson: string | null;
  theme: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const rows: HistoryRow[] = [];
let nextId = 1;

vi.mock("./db", () => ({
  listCursorPromptHistory: async (userId: number) => rows.filter((row) => row.userId === userId),
  insertCursorPromptHistory: async (input: Omit<HistoryRow, "id" | "createdAt" | "updatedAt" | "isFavorite"> & { isFavorite?: boolean }) => {
    const now = new Date();
    const row = { ...input, id: nextId++, isFavorite: input.isFavorite ?? false, createdAt: now, updatedAt: now };
    rows.push(row);
    return row.id;
  },
  setCursorPromptFavorite: async (userId: number, id: number, isFavorite: boolean) => {
    const row = rows.find((candidate) => candidate.userId === userId && candidate.id === id);
    if (!row) return null;
    row.isFavorite = isFavorite;
    return row;
  },
  deleteCursorPromptHistory: async (userId: number, id: number) => {
    const index = rows.findIndex((candidate) => candidate.userId === userId && candidate.id === id);
    if (index >= 0) rows.splice(index, 1);
    return true;
  },
}));

function createContext(userId?: number): TrpcContext {
  return {
    user: userId ? { id: userId, openId: `user-${userId}`, email: null, name: `User ${userId}`, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validInput = { title: "Reference prompt", imageUrl: "https://example.com/reference.png", prompt: "A sufficiently long cursor generation prompt with safe margins and transparent background requirements.", theme: "Test theme", appearance: { hairstyle: "short" } };

describe("cursor.history", () => {
  it("requires authentication for every history operation", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.cursor.history.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.cursor.history.create(validInput)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.cursor.history.toggleFavorite({ id: 1, isFavorite: true })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.cursor.history.remove({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("supports create, list, favorite, and remove for the logged-in user", async () => {
    rows.length = 0;
    const caller = appRouter.createCaller(createContext(10));
    const created = await caller.cursor.history.create(validInput);
    expect(created.id).toBeTypeOf("number");
    expect(await caller.cursor.history.list()).toHaveLength(1);
    expect((await caller.cursor.history.toggleFavorite({ id: created.id, isFavorite: true }))?.isFavorite).toBe(true);
    await caller.cursor.history.remove({ id: created.id });
    expect(await caller.cursor.history.list()).toHaveLength(0);
  });

  it("isolates rows across users for list, favorite, and remove", async () => {
    rows.length = 0;
    const userA = appRouter.createCaller(createContext(21));
    const userB = appRouter.createCaller(createContext(22));
    const created = await userA.cursor.history.create(validInput);
    expect(await userB.cursor.history.list()).toHaveLength(0);
    expect(await userB.cursor.history.toggleFavorite({ id: created.id, isFavorite: true })).toBeNull();
    await userB.cursor.history.remove({ id: created.id });
    expect(await userA.cursor.history.list()).toHaveLength(1);
    expect((await userA.cursor.history.list())[0]?.isFavorite).toBe(false);
  });
});
