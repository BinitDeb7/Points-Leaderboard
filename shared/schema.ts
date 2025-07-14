import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  points: integer("points").default(0).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claimHistory = pgTable("claim_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  avatar: true,
});

export const insertClaimHistorySchema = createInsertSchema(claimHistory).pick({
  userId: true,
  pointsAwarded: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClaimHistory = z.infer<typeof insertClaimHistorySchema>;
export type ClaimHistory = typeof claimHistory.$inferSelect;
