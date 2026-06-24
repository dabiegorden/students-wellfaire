import { db } from "@/src/db";

export { db };
export * as schema from "@/src/schema";

/**
 * Legacy no-op kept for backwards compatibility while routes are migrated
 * from Mongoose to Drizzle. Neon/Drizzle needs no explicit connect step.
 */
export async function connectDB() {
  return db;
}

/**
 * Adds a Mongo-style `_id` alias to a row (or array of rows) so any frontend
 * code still reading `_id` keeps working alongside the new `id` field.
 */
export function serialize<T extends { id?: string }>(row: T): T & { _id?: string };
export function serialize<T extends { id?: string }>(
  rows: T[],
): (T & { _id?: string })[];
export function serialize(input: any): any {
  if (Array.isArray(input)) return input.map((r) => serialize(r));
  if (input && typeof input === "object" && "id" in input) {
    return { ...input, _id: input.id };
  }
  return input;
}
