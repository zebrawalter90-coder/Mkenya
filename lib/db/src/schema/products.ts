import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  imageObjectPath: text("image_object_path").notNull(),
  category: text("category").notNull(),
  ownerId: text("owner_id").notNull(),
  ownerName: text("owner_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductRow = typeof productsTable.$inferSelect;
