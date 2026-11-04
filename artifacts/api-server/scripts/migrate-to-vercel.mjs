import { createHash } from "node:crypto";
import pg from "pg";
import { Storage } from "@google-cloud/storage";
import { put } from "@vercel/blob";

const { Client } = pg;
const sourceDatabaseUrl = process.env.DATABASE_URL;
const targetDatabaseUrl = process.env.VERCEL_DATABASE_URL;
const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;

if (!sourceDatabaseUrl) {
  throw new Error("DATABASE_URL must point to the existing Replit development database.");
}
if (!targetDatabaseUrl) {
  throw new Error("Set VERCEL_DATABASE_URL to the new Vercel-connected PostgreSQL database.");
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("Set BLOB_READ_WRITE_TOKEN from the Vercel Blob store before migrating images.");
}
if (!privateObjectDir) {
  throw new Error("PRIVATE_OBJECT_DIR is required to read existing product images.");
}

const sidecarEndpoint = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${sidecarEndpoint}/token`,
    type: "external_account",
    credential_source: {
      url: `${sidecarEndpoint}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function parseObjectPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const parts = normalized.split("/");
  if (parts.length < 3 || !parts[1] || !parts.slice(2).join("/")) {
    throw new Error(`Invalid storage path: ${path}`);
  }
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function sourceObjectFile(objectPath) {
  if (!objectPath.startsWith("/objects/")) {
    throw new Error(`Unsupported legacy image path: ${objectPath}`);
  }

  const entityPath = objectPath.slice("/objects/".length);
  const fullPath = `${privateObjectDir.replace(/\/+$/, "")}/${entityPath}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  return storage.bucket(bucketName).file(objectName);
}

function extensionFor(contentType) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

async function migrateImage(objectPath, imageUrlMap) {
  if (imageUrlMap.has(objectPath)) return imageUrlMap.get(objectPath);
  if (/^https?:\/\//i.test(objectPath)) {
    imageUrlMap.set(objectPath, objectPath);
    return objectPath;
  }

  const file = sourceObjectFile(objectPath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`A referenced product image is missing from Replit storage: ${objectPath}`);
  }

  const [[buffer], [metadata]] = await Promise.all([
    file.download(),
    file.getMetadata(),
  ]);
  const contentType = metadata.contentType || "image/jpeg";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error(`Unsupported product image content type: ${contentType}`);
  }

  const key = createHash("sha256").update(objectPath).digest("hex");
  const blob = await put(
    `product-images/migrated/${key}.${extensionFor(contentType)}`,
    buffer,
    {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    },
  );
  imageUrlMap.set(objectPath, blob.url);
  return blob.url;
}

const source = new Client({ connectionString: sourceDatabaseUrl });
const target = new Client({ connectionString: targetDatabaseUrl });

const tableNames = [
  "products",
  "product_images",
  "likes",
  "comments",
  "flash_sales",
  "chat_messages",
];

async function assertTargetSchema() {
  const result = await target.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [tableNames],
  );
  const present = new Set(result.rows.map((row) => row.table_name));
  const missing = tableNames.filter((name) => !present.has(name));
  if (missing.length) {
    throw new Error(
      `Vercel database schema is missing: ${missing.join(", ")}. Run the Vercel schema push first.`,
    );
  }
}

async function insertRows(client, sql, rows, valuesForRow) {
  for (const row of rows) {
    await client.query(sql, valuesForRow(row));
  }
}

try {
  await Promise.all([source.connect(), target.connect()]);
  await assertTargetSchema();

  const [productsResult, productImagesResult, likesResult, commentsResult, flashSalesResult, chatResult] =
    await Promise.all([
      source.query("SELECT * FROM products ORDER BY id"),
      source.query("SELECT * FROM product_images ORDER BY product_id, sort_order, id"),
      source.query("SELECT * FROM likes ORDER BY id"),
      source.query("SELECT * FROM comments ORDER BY id"),
      source.query("SELECT * FROM flash_sales ORDER BY id"),
      source.query("SELECT * FROM chat_messages ORDER BY id"),
    ]);

  const imagePaths = new Set([
    ...productsResult.rows.map((row) => row.image_object_path),
    ...productImagesResult.rows.map((row) => row.object_path),
  ]);
  const imageUrlMap = new Map();
  for (const path of imagePaths) {
    await migrateImage(path, imageUrlMap);
  }

  await target.query("BEGIN");
  try {
    await insertRows(
      target,
      `INSERT INTO products
        (id, name, description, price, image_object_path, category, owner_id, owner_name, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      productsResult.rows,
      (row) => [
        row.id,
        row.name,
        row.description,
        row.price,
        imageUrlMap.get(row.image_object_path) ?? row.image_object_path,
        row.category,
        row.owner_id,
        row.owner_name,
        row.created_at,
      ],
    );

    await insertRows(
      target,
      `INSERT INTO product_images
        (id, product_id, object_path, sort_order, created_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      productImagesResult.rows,
      (row) => [
        row.id,
        row.product_id,
        imageUrlMap.get(row.object_path) ?? row.object_path,
        row.sort_order,
        row.created_at,
      ],
    );

    await insertRows(
      target,
      `INSERT INTO likes (id, product_id, user_id, created_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      likesResult.rows,
      (row) => [row.id, row.product_id, row.user_id, row.created_at],
    );

    await insertRows(
      target,
      `INSERT INTO comments (id, product_id, user_id, username, text, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      commentsResult.rows,
      (row) => [
        row.id,
        row.product_id,
        row.user_id,
        row.username,
        row.text,
        row.created_at,
      ],
    );

    await insertRows(
      target,
      `INSERT INTO flash_sales
        (id, product_id, sale_price, starts_at, ends_at, is_published, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      flashSalesResult.rows,
      (row) => [
        row.id,
        row.product_id,
        row.sale_price,
        row.starts_at,
        row.ends_at,
        row.is_published,
        row.created_by,
        row.created_at,
        row.updated_at,
      ],
    );

    await insertRows(
      target,
      `INSERT INTO chat_messages (id, user_id, username, text, created_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      chatResult.rows,
      (row) => [row.id, row.user_id, row.username, row.text, row.created_at],
    );

    await target.query(
      `SELECT setval(
        pg_get_serial_sequence('likes', 'id'),
        COALESCE((SELECT MAX(id) FROM likes), 1),
        EXISTS(SELECT 1 FROM likes)
      )`,
    );
    await target.query("COMMIT");
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  }

  const counts = {};
  for (const table of tableNames) {
    const result = await target.query(`SELECT count(*)::int AS count FROM ${table}`);
    counts[table] = result.rows[0].count;
  }

  console.info("Vercel data migration completed without deleting source data.", {
    sourceCounts: {
      products: productsResult.rowCount,
      product_images: productImagesResult.rowCount,
      likes: likesResult.rowCount,
      comments: commentsResult.rowCount,
      flash_sales: flashSalesResult.rowCount,
      chat_messages: chatResult.rowCount,
    },
    uniqueImagesCopied: [...imageUrlMap.keys()].filter((path) => path.startsWith("/objects/")).length,
    targetCounts: counts,
  });
} finally {
  await Promise.allSettled([source.end(), target.end()]);
}
