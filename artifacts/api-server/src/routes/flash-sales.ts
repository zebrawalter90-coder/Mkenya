import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, desc, eq, gt, lte } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, flashSalesTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

type FlashSaleInput = {
  productId: string;
  salePrice: number;
  startsAt: string;
  endsAt: string;
  isPublished?: boolean;
  createdBy?: string;
};

function buildImageUrl(objectPath: string) {
  return `/api/storage${objectPath}`;
}

function parseFlashSaleInput(body: unknown): { data?: FlashSaleInput; error?: string } {
  const value = body as Record<string, unknown> | null;
  if (!value || typeof value !== "object") return { error: "Flash sale details are required." };

  const productId = typeof value.productId === "string" ? value.productId.trim() : "";
  const salePrice = Number(value.salePrice);
  const startsAt = typeof value.startsAt === "string" ? value.startsAt : "";
  const endsAt = typeof value.endsAt === "string" ? value.endsAt : "";
  const isPublished = value.isPublished === undefined ? false : value.isPublished;
  const createdBy = typeof value.createdBy === "string" ? value.createdBy.trim() : "";

  if (!productId) return { error: "Choose a product." };
  if (!Number.isInteger(salePrice) || salePrice <= 0) return { error: "Sale price must be a whole number above zero." };
  if (!startsAt || Number.isNaN(Date.parse(startsAt))) return { error: "Choose a valid start time." };
  if (!endsAt || Number.isNaN(Date.parse(endsAt))) return { error: "Choose a valid end time." };
  if (new Date(endsAt) <= new Date(startsAt)) return { error: "End time must be after the start time." };
  if (typeof isPublished !== "boolean") return { error: "Published status must be true or false." };
  if (!createdBy) return { error: "Admin user is required." };

  return {
    data: { productId, salePrice, startsAt, endsAt, isPublished, createdBy },
  };
}

async function getFlashSales(where?: ReturnType<typeof and>) {
  const rows = await db
    .select({ sale: flashSalesTable, product: productsTable })
    .from(flashSalesTable)
    .innerJoin(productsTable, eq(flashSalesTable.productId, productsTable.id))
    .where(where)
    .orderBy(asc(flashSalesTable.startsAt), desc(flashSalesTable.createdAt));

  return rows.map(({ sale, product }) => ({
    id: sale.id,
    productId: sale.productId,
    salePrice: sale.salePrice,
    startsAt: sale.startsAt.toISOString(),
    endsAt: sale.endsAt.toISOString(),
    isPublished: sale.isPublished,
    createdBy: sale.createdBy,
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    product: {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: product.price,
      imageUrl: buildImageUrl(product.imageObjectPath),
      category: product.category,
      ownerId: product.ownerId,
      ownerName: product.ownerName,
    },
  }));
}

router.get("/flash-sales/active", async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  res.json(await getFlashSales(and(
    eq(flashSalesTable.isPublished, true),
    lte(flashSalesTable.startsAt, now),
    gt(flashSalesTable.endsAt, now),
  )));
});

// TODO: Replace browser userId checks with real admin authentication.
router.get("/flash-sales/admin", async (_req: Request, res: Response): Promise<void> => {
  res.json(await getFlashSales());
});

router.post("/flash-sales", async (req: Request, res: Response): Promise<void> => {
  const parsed = parseFlashSaleInput(req.body);
  if (!parsed.data) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, parsed.data.productId),
  });
  if (!product) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  if (parsed.data.salePrice >= product.price) {
    res.status(400).json({ error: "Flash sale price must be lower than the regular product price." });
    return;
  }

  const [sale] = await db
    .insert(flashSalesTable)
    .values({
      id: randomUUID(),
      productId: parsed.data.productId,
      salePrice: parsed.data.salePrice,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      isPublished: parsed.data.isPublished ?? false,
      createdBy: parsed.data.createdBy!,
    })
    .returning();

  const [response] = await getFlashSales(eq(flashSalesTable.id, sale.id));
  res.status(201).json(response);
});

router.put("/flash-sales/:id", async (req: Request, res: Response): Promise<void> => {
  const saleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!saleId) {
    res.status(400).json({ error: "Flash sale ID is required." });
    return;
  }
  const parsed = parseFlashSaleInput(req.body);
  if (!parsed.data) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const existing = await db.query.flashSalesTable.findFirst({
    where: eq(flashSalesTable.id, saleId),
  });
  if (!existing) {
    res.status(404).json({ error: "Flash sale not found." });
    return;
  }

  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, parsed.data.productId),
  });
  if (!product) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  if (parsed.data.salePrice >= product.price) {
    res.status(400).json({ error: "Flash sale price must be lower than the regular product price." });
    return;
  }

  await db
    .update(flashSalesTable)
    .set({
      productId: parsed.data.productId,
      salePrice: parsed.data.salePrice,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      isPublished: parsed.data.isPublished ?? false,
      updatedAt: new Date(),
    })
    .where(eq(flashSalesTable.id, saleId));

  const [response] = await getFlashSales(eq(flashSalesTable.id, saleId));
  res.json(response);
});

router.delete("/flash-sales/:id", async (req: Request, res: Response): Promise<void> => {
  const saleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!saleId) {
    res.status(400).json({ error: "Flash sale ID is required." });
    return;
  }
  const [deleted] = await db
    .delete(flashSalesTable)
    .where(eq(flashSalesTable.id, saleId))
    .returning({ id: flashSalesTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Flash sale not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;