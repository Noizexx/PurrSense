import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// ─── USERS ────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id:            text("id").primaryKey(),
  email:         text("email").notNull().unique(),
  name:          text("name"),
  passwordHash:  text("password_hash"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image:         text("image"),
  createdAt:     text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id:           text("id").primaryKey(),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      text("expires").notNull(),
  sessionToken: text("session_token").notNull().unique(),
});

export const accounts = sqliteTable("accounts", {
  id:                text("id").primaryKey(),
  userId:            text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull().unique(),
  expires:    text("expires").notNull(),
});

// ─── CATS ─────────────────────────────────────────────────────────────────────

export const cats = sqliteTable("cats", {
  id:              text("id").primaryKey(),
  userId:          text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:            text("name").notNull(),
  birthDate:       text("birth_date"),
  sex:             text("sex").default("unknown"),
  breed:           text("breed").default("unknown"),
  lifestyle:       text("lifestyle").default("indoor"),
  sterilized:      text("sterilized").default("unknown"),
  microchip:       text("microchip"),
  mainFood:        text("main_food"),
  foodKcalPerKg:   integer("food_kcal_per_kg"),
  planDryGrams:    integer("plan_dry_grams").default(60),
  planMealsPerDay: integer("plan_meals_per_day").default(3),
  planWetPerWeek:  integer("plan_wet_per_week").default(1),
  notes:           text("notes"),
  photoUrl:        text("photo_url"),
  createdAt:       text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt:       text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  userIdx: index("cats_user_idx").on(t.userId),
}));

// ─── DAILY LOGS ───────────────────────────────────────────────────────────────

export const dailyLogs = sqliteTable("daily_logs", {
  id:               text("id").primaryKey(),
  catId:            text("cat_id").notNull().references(() => cats.id, { onDelete: "cascade" }),
  date:             text("date").notNull(),
  weight:           real("weight"),
  bcs:              integer("bcs"),
  mcs:              text("mcs"),
  dryGrams:         real("dry_grams"),
  wetGrams:         real("wet_grams"),
  meals:            integer("meals"),
  snackKcal:        real("snack_kcal"),
  waterMl:          real("water_ml"),
  playMinutes:      integer("play_minutes"),
  groomingSessions: integer("grooming_sessions"),
  shedding:         integer("shedding"),
  fecesNotes:       text("feces_notes"),
  vomiting:         integer("vomiting", { mode: "boolean" }).default(false),
  diarrhea:         integer("diarrhea", { mode: "boolean" }).default(false),
  behaviorNotes:    text("behavior_notes"),
  createdAt:        text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  catDateIdx: index("logs_cat_date_idx").on(t.catId, t.date),
}));

// ─── PREVENTION ───────────────────────────────────────────────────────────────

export const prevention = sqliteTable("prevention", {
  id:        text("id").primaryKey(),
  catId:     text("cat_id").notNull().references(() => cats.id, { onDelete: "cascade" }),
  type:      text("type").notNull(), // vaccine | antiparasitic | sterilization | visit
  name:      text("name").notNull(),
  date:      text("date"),
  nextDate:  text("next_date"),
  notes:     text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── PHOTOS ───────────────────────────────────────────────────────────────────

export const photos = sqliteTable("photos", {
  id:       text("id").primaryKey(),
  catId:    text("cat_id").notNull().references(() => cats.id, { onDelete: "cascade" }),
  url:      text("url").notNull(),
  type:     text("type").default("profile"), // profile | dorsal | lateral | other
  takenAt:  text("taken_at").default(sql`CURRENT_TIMESTAMP`),
  notes:    text("notes"),
});

// ─── SHARE TOKENS ─────────────────────────────────────────────────────────────

export const shareTokens = sqliteTable("share_tokens", {
  id:        text("id").primaryKey(),
  catId:     text("cat_id").notNull().references(() => cats.id, { onDelete: "cascade" }),
  token:     text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  cats:     many(cats),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const catsRelations = relations(cats, ({ one, many }) => ({
  user:       one(users, { fields: [cats.userId], references: [users.id] }),
  logs:       many(dailyLogs),
  prevention: many(prevention),
  photos:     many(photos),
  shares:     many(shareTokens),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  cat: one(cats, { fields: [dailyLogs.catId], references: [cats.id] }),
}));

export const preventionRelations = relations(prevention, ({ one }) => ({
  cat: one(cats, { fields: [prevention.catId], references: [cats.id] }),
}));
