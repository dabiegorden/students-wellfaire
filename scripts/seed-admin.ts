import "dotenv/config";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { users } from "../src/schema";

/**
 * Creates a first-time admin account.
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * Safe to re-run: if an account with this email already exists, its password
 * is reset to the value below and the role is ensured to be "admin".
 */

const ADMIN = {
  email: "dabiegorden49@gmail.com",
  password: "12345678",
  firstName: "Gorden",
  lastName: "Dabie",
  staffId: "STF0000000099",
  department: "Students Affairs Office",
};

async function main() {
  const hashed = await bcryptjs.hash(ADMIN.password, 10);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN.email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        password: hashed,
        role: "admin",
        firstName: ADMIN.firstName,
        lastName: ADMIN.lastName,
        staffId: ADMIN.staffId,
        department: ADMIN.department,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    console.log(`Updated existing admin: ${ADMIN.email}`);
  } else {
    await db.insert(users).values({
      role: "admin",
      email: ADMIN.email,
      password: hashed,
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      staffId: ADMIN.staffId,
      department: ADMIN.department,
      emailVerified: true,
    });
    console.log(`Created admin: ${ADMIN.email}`);
  }

  console.log(`\nLogin with:`);
  console.log(`  Email:    ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});
