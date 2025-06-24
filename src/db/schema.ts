import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["recruiter", "job seeker"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  companyName: text("company_name").notNull(),
  position: text("position"),
  phone: text("phone"),
});

export const applicantProfiles = pgTable("applicant_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  fullName: text("full_name").notNull(),
  education: text("education"),
  currentStatus: text("current_status"),
  age: integer("age"),
  resumeUrl: text("resume_url"),
});
