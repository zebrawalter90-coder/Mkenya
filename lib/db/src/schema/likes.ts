import { pgTable, text, serial, timestamp, unique } from "drizzle-orm/pg-core";

export const likesTable = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.productId, t.userId)],
);

export type LikeRow = typeof likesTable.$inferSelect;
