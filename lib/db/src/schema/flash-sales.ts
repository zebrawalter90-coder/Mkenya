import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const flashSalesTable = pgTable("flash_sales", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  salePrice: integer("sale_price").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFlashSaleSchema = createInsertSchema(flashSalesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertFlashSale = z.infer<typeof insertFlashSaleSchema>;
export type FlashSaleRow = typeof flashSalesTable.$inferSelect;