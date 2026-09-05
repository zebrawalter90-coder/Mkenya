import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import {
  GetMpesaPaymentStatusParams,
  InitiateMpesaStkPushBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type MpesaPaymentRecord = {
  checkoutRequestId: string;
  status: "pending" | "completed" | "failed";
  resultCode?: number;
  resultDescription?: string;
  receipt?: string;
  createdAt: number;
};

const paymentRecords = new Map<string, MpesaPaymentRecord>();

function getMpesaBaseUrl() {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function getKenyaTimestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("07") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("2547") && digits.length === 12) return digits;
  return null;
}

function getRequiredMpesaConfig() {
  const required = [
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_SHORTCODE",
    "MPESA_PASSKEY",
    "MPESA_CALLBACK_URL",
  ] as const;

  if (required.some((key) => !process.env[key])) return null;

  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    shortcode: process.env.MPESA_SHORTCODE!,
    passkey: process.env.MPESA_PASSKEY!,
    callbackUrl: process.env.MPESA_CALLBACK_URL!,
    transactionType: process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline",
  };
}

async function getAccessToken(config: ReturnType<typeof getRequiredMpesaConfig>) {
  if (!config) throw new Error("M-Pesa configuration is incomplete");

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await fetch(
    `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    },
  );
  const payload = (await response.json()) as { access_token?: string; error_description?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? "Could not authenticate with M-Pesa");
  }

  return payload.access_token;
}

function readReceipt(callback: Record<string, unknown>) {
  const metadata = callback.CallbackMetadata as
    | { Item?: Array<{ Name?: string; Value?: string | number }> }
    | undefined;
  return metadata?.Item?.find((item) => item.Name === "MpesaReceiptNumber")?.Value?.toString();
}

router.post("/payments/mpesa/stk-push", async (req: Request, res: Response): Promise<void> => {
  const parsed = InitiateMpesaStkPushBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const config = getRequiredMpesaConfig();
  if (!config) {
    res.status(503).json({
      error: "M-Pesa STK Push is not configured yet. Use manual M-Pesa or WhatsApp checkout.",
    });
    return;
  }

  const phoneNumber = normalizePhone(parsed.data.phone);
  if (!phoneNumber) {
    res.status(400).json({ error: "Enter a valid Kenyan Safaricom number, for example 0712345678." });
    return;
  }

  const timestamp = getKenyaTimestamp();
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");

  try {
    const accessToken = await getAccessToken(config);
    const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: config.transactionType,
        Amount: parsed.data.amount,
        PartyA: phoneNumber,
        PartyB: config.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: config.callbackUrl,
        AccountReference: parsed.data.orderRef,
        TransactionDesc: `Mkenya Shop order ${parsed.data.orderRef}`,
      }),
    });
    const payload = (await response.json()) as {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResponseCode?: string;
      ResponseDescription?: string;
      CustomerMessage?: string;
    };

    if (!response.ok || payload.ResponseCode !== "0" || !payload.CheckoutRequestID || !payload.MerchantRequestID) {
      res.status(400).json({
        error: payload.ResponseDescription ?? "M-Pesa could not start the payment prompt.",
      });
      return;
    }

    paymentRecords.set(payload.CheckoutRequestID, {
      checkoutRequestId: payload.CheckoutRequestID,
      status: "pending",
      createdAt: Date.now(),
    });

    res.json({
      merchantRequestId: payload.MerchantRequestID,
      checkoutRequestId: payload.CheckoutRequestID,
      customerMessage: payload.CustomerMessage ?? "Check your phone and enter your M-Pesa PIN.",
      status: "pending",
    });
  } catch (error) {
    logger.error({ err: error }, "M-Pesa STK Push failed");
    res.status(502).json({ error: "M-Pesa is temporarily unavailable. Try manual M-Pesa checkout instead." });
  }
});

router.get("/payments/mpesa/status/:checkoutRequestId", (req: Request, res: Response): void => {
  const parsed = GetMpesaPaymentStatusParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const record = paymentRecords.get(parsed.data.checkoutRequestId);
  if (!record) {
    res.status(404).json({ error: "Payment status not found or expired." });
    return;
  }

  res.json({
    checkoutRequestId: record.checkoutRequestId,
    status: record.status,
    resultCode: record.resultCode,
    resultDescription: record.resultDescription,
    receipt: record.receipt,
  });
});

router.post("/payments/mpesa/callback", (req: Request, res: Response): void => {
  const callback = (req.body?.Body?.stkCallback ?? {}) as Record<string, unknown>;
  const checkoutRequestId = callback?.CheckoutRequestID?.toString();

  if (checkoutRequestId) {
    const record = paymentRecords.get(checkoutRequestId);
    if (record) {
      const resultCode = Number(callback?.ResultCode ?? 1);
      record.resultCode = resultCode;
      record.resultDescription = callback?.ResultDesc?.toString() ?? "Payment response received";
      record.receipt = resultCode === 0 ? readReceipt(callback) : undefined;
      record.status = resultCode === 0 ? "completed" : "failed";
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Keep short-lived payment state from growing if a callback never arrives.
setInterval(() => {
  const expiry = Date.now() - 30 * 60 * 1000;
  for (const [checkoutRequestId, record] of paymentRecords) {
    if (record.createdAt < expiry) paymentRecords.delete(checkoutRequestId);
  }
}, 10 * 60 * 1000).unref();

export default router;