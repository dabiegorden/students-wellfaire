import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Authenticated accounts (students + admins).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull().default("students"), // "students" | "admin"
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),

  // Student-specific
  studentId: text("student_id").unique(),
  faculty: text("faculty"),
  programme: text("programme"),
  level: text("level"),

  // Admin-specific
  staffId: text("staff_id").unique(),
  department: text("department"),

  emailVerified: boolean("email_verified").notNull().default(false),
  lastSeen: timestamp("last_seen"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Official registry of all enrolled students. Used to verify a Student ID
 * really exists before allowing registration. This is reference data,
 * separate from the authenticated `users` table.
 */
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull().unique(),
  faculty: text("faculty").notNull(),
  programme: text("programme").notNull(),
  level: text("level").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Student complaints with AI triage + admin/AI replies.
 */
export const complaints = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("Pending"),

  // Reply
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  adminReply: text("admin_reply"),
  repliedAt: timestamp("replied_at"),
  repliedBy: text("replied_by"), // "admin" | "ai"

  // AI analysis (triage)
  aiPriority: text("ai_priority"),
  aiExplanation: text("ai_explanation"),
  aiScore: integer("ai_score"),
  aiAnalysedAt: timestamp("ai_analysed_at"),

  // AI automatic acknowledgement response (sent to the student on submission)
  aiResponse: text("ai_response"),
  aiGeneratedAt: timestamp("ai_generated_at"),
  aiModel: text("ai_model"),

  // Acknowledgement email delivery tracking
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
  emailStatus: text("email_status"), // "sent" | "failed" | null

  // Async acknowledgement workflow state (prevents duplicates / races)
  processingStatus: text("processing_status"), // "pending" | "processing" | "completed" | "failed"
  processingError: text("processing_error"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Announcements published by admins.
 */
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: text("category").notNull().default("General"),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * One conversation thread per student (with the admin team).
 */
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  student: uuid("student")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  lastMessage: text("last_message").default(""),
  lastMessageAt: timestamp("last_message_at"),
  lastMessageSender: text("last_message_sender"), // "students" | "admin"
  studentUnreadCount: integer("student_unread_count").notNull().default(0),
  adminUnreadCount: integer("admin_unread_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Individual chat messages.
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation: uuid("conversation")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  sender: uuid("sender")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  senderRole: text("sender_role").notNull(), // "students" | "admin"
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Short-lived password reset codes sent by email.
 */
export const passwordResetCodes = pgTable("password_reset_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type StudentRecord = typeof students.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
