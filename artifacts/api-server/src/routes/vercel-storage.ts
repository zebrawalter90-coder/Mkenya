import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRODUCT_IMAGE_PATH = /^product-images\/[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i;

function makeWebRequest(req: Request): Request {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(name, value.join(", "));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const host = req.get("host");
  if (!host) {
    throw new Error("The request host is missing.");
  }

  const protocol = req.get("x-forwarded-proto")?.split(",")[0] ?? req.protocol;
  return new globalThis.Request(`${protocol}://${host}${req.originalUrl}`, {
    method: req.method,
    headers,
  }) as unknown as Request;
}

router.post("/storage/uploads", async (req, res): Promise<void> => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(503).json({
      error: "Vercel Blob is not connected. Add a public Blob store to this Vercel project.",
    });
    return;
  }

  const origin = req.get("origin");
  const host = req.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host.toLowerCase() !== host.toLowerCase()) {
        res.status(403).json({ error: "Uploads must come from this shop." });
        return;
      }
    } catch {
      res.status(403).json({ error: "Invalid upload origin." });
      return;
    }
  }

  try {
    const response = await handleUpload({
      body: req.body as HandleUploadBody,
      request: makeWebRequest(req),
      onBeforeGenerateToken: async (pathname) => {
        if (!PRODUCT_IMAGE_PATH.test(pathname)) {
          throw new Error("Only product image uploads are allowed.");
        }

        return {
          allowedContentTypes: SUPPORTED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: false,
        };
      },
    });

    res.status(200).json(response);
  } catch (error) {
    (req as any).log?.warn({ err: error }, "Vercel Blob upload authorization failed");
    res.status(400).json({
      error: "Could not authorize this upload. Check the image and Vercel Blob configuration.",
    });
  }
});

export default router;
