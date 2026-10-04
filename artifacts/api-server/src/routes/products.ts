import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { asc, eq, sql } from "drizzle-orm";
import { db, productsTable, likesTable, commentsTable, flashSalesTable, productImagesTable } from "@workspace/db";
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
  const [comments, likes, images] = await Promise.all([
    db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.productId, product.id))
      .orderBy(commentsTable.createdAt),
    db.select().from(likesTable).where(eq(likesTable.productId, product.id)),
    db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, product.id))
      .orderBy(asc(productImagesTable.sortOrder), asc(productImagesTable.createdAt)),
  ]);

  const userLiked = userId ? likes.some((l) => l.userId === userId) : false;
  const imageUrls = images.length > 0
    ? images.map((image) => buildImageUrl(image.objectPath))
    : [buildImageUrl(product.imageObjectPath)];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    imageUrl: imageUrls[0],
    imageUrls,
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

  const [allLikes, allComments, allImages] = await Promise.all([
    db.select().from(likesTable),
    db.select().from(commentsTable).orderBy(commentsTable.createdAt),
    db.select().from(productImagesTable).orderBy(asc(productImagesTable.sortOrder), asc(productImagesTable.createdAt)),
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

  const imagesByProduct = new Map<string, typeof allImages>();
  for (const image of allImages) {
    if (!imagesByProduct.has(image.productId)) imagesByProduct.set(image.productId, []);
    imagesByProduct.get(image.productId)!.push(image);
  }

  const result = products.map((p) => {
    const likes = likesByProduct.get(p.id) ?? [];
    const comments = commentsByProduct.get(p.id) ?? [];
    const imageUrls = (imagesByProduct.get(p.id) ?? []).map((image) => buildImageUrl(image.objectPath));
    const resolvedImageUrls = imageUrls.length > 0 ? imageUrls : [buildImageUrl(p.imageObjectPath)];
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      price: p.price,
      imageUrl: resolvedImageUrls[0],
      imageUrls: resolvedImageUrls,
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

  const { id: requestedId, name, description, price, imageObjectPath, imageObjectPaths, category, ownerId, ownerName } = parsed.data;
  const resolvedImagePaths = Array.from(new Set([
    imageObjectPath,
    ...(imageObjectPaths ?? []),
  ]));

  const saveResult = await db.transaction(async (tx) => {
    const [createdProduct] = await tx
      .insert(productsTable)
      .values({
        id: requestedId ?? randomUUID(),
        name,
        description: description ?? null,
        price,
        imageObjectPath,
        category,
        ownerId,
        ownerName,
      })
      .onConflictDoNothing({ target: productsTable.id })
      .returning();

    if (createdProduct) {
      await tx.insert(productImagesTable).values(
        resolvedImagePaths.map((objectPath, sortOrder) => ({
          id: randomUUID(),
          productId: createdProduct.id,
          objectPath,
          sortOrder,
        })),
      );
      return { kind: "created" as const, product: createdProduct };
    }

    if (!requestedId) return { kind: "conflict" as const };

    const [existingProduct] = await tx
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, requestedId));
    if (!existingProduct || existingProduct.ownerId !== ownerId) {
      return { kind: "conflict" as const };
    }

    const existingImages = await tx
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, requestedId))
      .orderBy(asc(productImagesTable.sortOrder), asc(productImagesTable.createdAt));
    const matchesOriginalRequest =
      existingProduct.name === name &&
      existingProduct.description === (description ?? null) &&
      existingProduct.price === price &&
      existingProduct.imageObjectPath === imageObjectPath &&
      existingProduct.category === category &&
      existingProduct.ownerName === ownerName &&
      existingImages.map((image) => image.objectPath).join("\u0000") === resolvedImagePaths.join("\u0000");

    return matchesOriginalRequest
      ? { kind: "duplicate" as const, product: existingProduct }
      : { kind: "conflict" as const };
  });

  if (saveResult.kind === "conflict") {
    res.status(409).json({
      error: "This save ID is already attached to a different listing. Check your listings before starting a new one.",
    });
    return;
  }

  const response = await buildProductResponse(saveResult.product, ownerId);
  res.status(saveResult.kind === "created" ? 201 : 200).json(response);
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
    .set({ name: parsed.data.name, description: parsed.data.description ?? null, price: parsed.data.price })
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

  await db.transaction(async (tx) => {
    await tx.delete(commentsTable).where(eq(commentsTable.productId, params.data.id));
    await tx.delete(likesTable).where(eq(likesTable.productId, params.data.id));
    await tx.delete(productImagesTable).where(eq(productImagesTable.productId, params.data.id));
    await tx.delete(flashSalesTable).where(eq(flashSalesTable.productId, params.data.id));
    await tx.delete(productsTable).where(eq(productsTable.id, params.data.id));
  });

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
