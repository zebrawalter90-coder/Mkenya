import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db, productsTable, likesTable, commentsTable } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  ToggleLikeBody,
  AddCommentBody,
  GetProductsQueryParams,
  DeleteProductParams,
  UpdateProductParams,
  ToggleLikeParams,
  AddCommentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildImageUrl(objectPath: string): string {
  return `/api/storage${objectPath}`;
}

async function buildProductResponse(product: typeof productsTable.$inferSelect, userId?: string) {
  const [comments, likes] = await Promise.all([
    db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.productId, product.id))
      .orderBy(commentsTable.createdAt),
    db.select().from(likesTable).where(eq(likesTable.productId, product.id)),
  ]);

  const userLiked = userId ? likes.some((l) => l.userId === userId) : false;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: buildImageUrl(product.imageObjectPath),
    category: product.category,
    ownerId: product.ownerId,
    ownerName: product.ownerName,
    likesCount: likes.length,
    userLiked,
    comments: comments.map((c) => ({
      id: c.id,
      productId: c.productId,
      userId: c.userId,
      username: c.username,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: product.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = GetProductsQueryParams.safeParse(req.query);
  const userId = parsed.success ? (parsed.data.userId ?? undefined) : undefined;

  const products = await db
    .select()
    .from(productsTable)
    .orderBy(sql`${productsTable.createdAt} DESC`);

  const [allLikes, allComments] = await Promise.all([
    db.select().from(likesTable),
    db.select().from(commentsTable).orderBy(commentsTable.createdAt),
  ]);

  const likesByProduct = new Map<string, typeof allLikes>();
  for (const like of allLikes) {
    if (!likesByProduct.has(like.productId)) likesByProduct.set(like.productId, []);
    likesByProduct.get(like.productId)!.push(like);
  }

  const commentsByProduct = new Map<string, typeof allComments>();
  for (const comment of allComments) {
    if (!commentsByProduct.has(comment.productId)) commentsByProduct.set(comment.productId, []);
    commentsByProduct.get(comment.productId)!.push(comment);
  }

  const result = products.map((p) => {
    const likes = likesByProduct.get(p.id) ?? [];
    const comments = commentsByProduct.get(p.id) ?? [];
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: buildImageUrl(p.imageObjectPath),
      category: p.category,
      ownerId: p.ownerId,
      ownerName: p.ownerName,
      likesCount: likes.length,
      userLiked: userId ? likes.some((l) => l.userId === userId) : false,
      comments: comments.map((c) => ({
        id: c.id,
        productId: c.productId,
        userId: c.userId,
        username: c.username,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: p.createdAt.toISOString(),
    };
  });

  res.json(result);
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, price, imageObjectPath, category, ownerId, ownerName } = parsed.data;

  const [product] = await db
    .insert(productsTable)
    .values({
      id: randomUUID(),
      name,
      price,
      imageObjectPath,
      category,
      ownerId,
      ownerName,
    })
    .returning();

  const response = await buildProductResponse(product, ownerId);
  res.status(201).json(response);
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  if (existing.ownerId !== parsed.data.userId) {
    res.status(403).json({ error: "Not the owner" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({ name: parsed.data.name, price: parsed.data.price })
    .where(eq(productsTable.id, params.data.id))
    .returning();

  const response = await buildProductResponse(updated, parsed.data.userId);
  res.json(response);
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  if (existing.ownerId !== userId) {
    res.status(403).json({ error: "Not the owner" });
    return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.productId, params.data.id));
  await db.delete(likesTable).where(eq(likesTable.productId, params.data.id));
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));

  res.sendStatus(204);
});

router.post("/products/:id/like", async (req, res): Promise<void> => {
  const params = ToggleLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ToggleLikeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { userId } = parsed.data;

  const existingLikes = await db
    .select()
    .from(likesTable)
    .where(sql`${likesTable.productId} = ${params.data.id} AND ${likesTable.userId} = ${userId}`);

  const alreadyLiked = existingLikes.length > 0;

  if (alreadyLiked) {
    await db
      .delete(likesTable)
      .where(
        sql`${likesTable.productId} = ${params.data.id} AND ${likesTable.userId} = ${userId}`,
      );
  } else {
    await db
      .insert(likesTable)
      .values({ productId: params.data.id, userId })
      .onConflictDoNothing();
  }

  const updatedLikes = await db
    .select()
    .from(likesTable)
    .where(eq(likesTable.productId, params.data.id));

  res.json({
    liked: !alreadyLiked,
    likesCount: updatedLikes.length,
  });
});

router.post("/products/:id/comments", async (req, res): Promise<void> => {
  const params = AddCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({
      id: randomUUID(),
      productId: params.data.id,
      userId: parsed.data.userId,
      username: parsed.data.username,
      text: parsed.data.text,
    })
    .returning();

  res.status(201).json({
    id: comment.id,
    productId: comment.productId,
    userId: comment.userId,
    username: comment.username,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  });
});

export default router;
