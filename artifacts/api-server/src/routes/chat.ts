import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db, chatMessagesTable } from "@workspace/db";
import { SendChatMessageBody } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/chat", async (_req, res): Promise<void> => {
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .orderBy(sql`${chatMessagesTable.createdAt} ASC`)
    .limit(200);

  res.json(
    messages.map((m) => ({
      id: m.id,
      userId: m.userId,
      username: m.username,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(chatMessagesTable)
    .values({
      id: randomUUID(),
      userId: parsed.data.userId,
      username: parsed.data.username,
      text: parsed.data.text,
    })
    .returning();

  res.status(201).json({
    id: message.id,
    userId: message.userId,
    username: message.username,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  });
});

export default router;
