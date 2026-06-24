import "dotenv/config";
import bcryptjs from "bcryptjs";
import { db } from "../src/db";
import { users, students } from "../src/schema";
import { FACULTIES, PROGRAMMES, LEVELS } from "../lib/academics";

/**
 * Seeds:
 *  - An official student registry (used to verify Student IDs on registration)
 *  - A default admin account
 *  - A couple of demo student accounts that match the registry
 *
 * Safe to re-run: it skips rows that already exist (by studentId / email).
 */

type SeedStudent = {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  faculty: (typeof FACULTIES)[number];
  programme: (typeof PROGRAMMES)[number];
  level: (typeof LEVELS)[number];
};

const REGISTRY: SeedStudent[] = [
  { firstName: "Kwame", lastName: "Mensah", email: "kwame.mensah@st.cug.edu.gh", studentId: "UGR0000000001", faculty: FACULTIES[0], programme: "Computer Science", level: "Level 100" },
  { firstName: "Akosua", lastName: "Boateng", email: "akosua.boateng@st.cug.edu.gh", studentId: "UGR0000000002", faculty: FACULTIES[0], programme: "Information Technology", level: "Level 200" },
  { firstName: "Yaw", lastName: "Owusu", email: "yaw.owusu@st.cug.edu.gh", studentId: "UGR0000000003", faculty: FACULTIES[0], programme: "Mathematics", level: "Level 300" },
  { firstName: "Ama", lastName: "Asante", email: "ama.asante@st.cug.edu.gh", studentId: "UGR0000000004", faculty: FACULTIES[1], programme: "Business Administration", level: "Level 400" },
  { firstName: "Kofi", lastName: "Adjei", email: "kofi.adjei@st.cug.edu.gh", studentId: "UGR0000000005", faculty: FACULTIES[1], programme: "Economics", level: "Level 500" },
  { firstName: "Abena", lastName: "Darko", email: "abena.darko@st.cug.edu.gh", studentId: "UGR0000000006", faculty: FACULTIES[2], programme: "Education", level: "Level 100" },
  { firstName: "Kojo", lastName: "Appiah", email: "kojo.appiah@st.cug.edu.gh", studentId: "UGR0000000007", faculty: FACULTIES[2], programme: "Psychology", level: "Level 200" },
  { firstName: "Adwoa", lastName: "Frimpong", email: "adwoa.frimpong@st.cug.edu.gh", studentId: "UGW0000000008", faculty: FACULTIES[3], programme: "Nursing", level: "Level 300" },
  { firstName: "Kwabena", lastName: "Osei", email: "kwabena.osei@st.cug.edu.gh", studentId: "UGW0000000009", faculty: FACULTIES[3], programme: "Nursing", level: "Level 400" },
  { firstName: "Esi", lastName: "Quaye", email: "esi.quaye@st.cug.edu.gh", studentId: "UGW0000000010", faculty: FACULTIES[4], programme: "Sociology", level: "Level 500" },
  { firstName: "Yaa", lastName: "Agyeman", email: "yaa.agyeman@st.cug.edu.gh", studentId: "UGR0000000011", faculty: FACULTIES[0], programme: "Computer Science", level: "Level 200" },
  { firstName: "Kwadwo", lastName: "Bediako", email: "kwadwo.bediako@st.cug.edu.gh", studentId: "UGR0000000012", faculty: FACULTIES[1], programme: "Business Administration", level: "Level 100" },
  { firstName: "Afia", lastName: "Sarpong", email: "afia.sarpong@st.cug.edu.gh", studentId: "UGR0000000013", faculty: FACULTIES[2], programme: "Education", level: "Level 300" },
  { firstName: "Kwaku", lastName: "Antwi", email: "kwaku.antwi@st.cug.edu.gh", studentId: "UGW0000000014", faculty: FACULTIES[3], programme: "Nursing", level: "Level 500" },
  { firstName: "Maame", lastName: "Ofori", email: "maame.ofori@st.cug.edu.gh", studentId: "UGR0000000015", faculty: FACULTIES[0], programme: "Physics", level: "Level 400" },
];

async function ensureRegistry() {
  const existing = await db.select({ studentId: students.studentId }).from(students);
  const existingIds = new Set(existing.map((s) => s.studentId));
  const toInsert = REGISTRY.filter((s) => !existingIds.has(s.studentId));
  if (toInsert.length) {
    await db.insert(students).values(toInsert);
    console.log(`Inserted ${toInsert.length} students into registry.`);
  } else {
    console.log("Student registry already up to date.");
  }
}

async function ensureUser(opts: {
  email: string;
  password: string;
  role: "admin" | "students";
  firstName: string;
  lastName: string;
  studentId?: string;
  faculty?: string;
  programme?: string;
  level?: string;
  staffId?: string;
  department?: string;
  resetPassword?: boolean;
}) {
  const { eq } = await import("drizzle-orm");
  const [found] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, opts.email))
    .limit(1);
  if (found) {
    if (opts.resetPassword) {
      const hashed = await bcryptjs.hash(opts.password, 10);
      await db
        .update(users)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(users.id, found.id));
      console.log(`Reset password for ${opts.email}`);
    } else {
      console.log(`User ${opts.email} already exists, skipping.`);
    }
    return;
  }
  const hashed = await bcryptjs.hash(opts.password, 10);
  await db.insert(users).values({
    role: opts.role,
    email: opts.email,
    password: hashed,
    firstName: opts.firstName,
    lastName: opts.lastName,
    studentId: opts.studentId,
    faculty: opts.faculty,
    programme: opts.programme,
    level: opts.level,
    staffId: opts.staffId,
    department: opts.department,
    emailVerified: true,
  });
  console.log(`Created ${opts.role} ${opts.email}`);
}

async function main() {
  await ensureRegistry();

  await ensureUser({
    email: "admin@cug.edu.gh",
    password: "admin1234",
    role: "admin",
    firstName: "CUG",
    lastName: "Administrator",
    staffId: "STF0000000001",
    department: "Students Affairs Office",
  });

  // Create a login account for every student in the registry with the
  // default password. They can change it after first login from Settings.
  const DEFAULT_STUDENT_PASSWORD = "cug2026";
  for (const s of REGISTRY) {
    await ensureUser({
      email: s.email,
      password: DEFAULT_STUDENT_PASSWORD,
      role: "students",
      firstName: s.firstName,
      lastName: s.lastName,
      studentId: s.studentId,
      faculty: s.faculty,
      programme: s.programme,
      level: s.level,
      resetPassword: true,
    });
  }

  console.log("\nSeed complete.");
  console.log("Admin:    admin@cug.edu.gh / admin1234");
  console.log(
    `Students: any registry email (e.g. ${REGISTRY[0].email}) / ${DEFAULT_STUDENT_PASSWORD}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
