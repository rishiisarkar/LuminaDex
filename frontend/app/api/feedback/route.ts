import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import type { FeedbackSubmission, FeedbackType } from "@/lib/feedback/types";

const validTypes: FeedbackType[] = ["rating", "bug", "feature", "general"];
const cooldown = new Map<string, number>();
const recentPayloads = new Map<string, number>();

export async function POST(request: NextRequest) {
  let body: Partial<FeedbackSubmission>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const validationError = validateFeedback(body);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const route = sanitizeText(body.route, 160);
  const identity = `${request.headers.get("x-forwarded-for") ?? "local"}:${route}`;
  const now = Date.now();
  if ((cooldown.get(identity) ?? 0) > now - 4000) {
    return NextResponse.json({ success: false, error: "Please wait before submitting again." }, { status: 429 });
  }

  const safeSubmission: FeedbackSubmission = {
    id: crypto.randomUUID(),
    type: body.type as FeedbackType,
    rating: body.rating,
    message: sanitizeText(body.message, 2000) ?? "",
    category: sanitizeText(body.category, 80),
    route,
    walletAddress: sanitizeWallet(body.walletAddress),
    walletConnected: Boolean(body.walletConnected),
    network: sanitizeText(body.network, 80),
    userAgent: sanitizeText(body.userAgent, 240),
    screenSize: sanitizeText(body.screenSize, 40),
    createdAt: new Date().toISOString(),
    metadata: sanitizeMetadata(body.metadata),
  };

  const fingerprint = JSON.stringify({
    type: safeSubmission.type,
    rating: safeSubmission.rating,
    message: safeSubmission.message,
    route: safeSubmission.route,
    walletAddress: safeSubmission.walletAddress,
  });
  if ((recentPayloads.get(fingerprint) ?? 0) > now - 60_000) {
    return NextResponse.json({ success: false, error: "Duplicate feedback." }, { status: 409 });
  }

  cooldown.set(identity, now);
  recentPayloads.set(fingerprint, now);

  await persistFeedback(safeSubmission);
  return NextResponse.json({ success: true, id: safeSubmission.id });
}

function validateFeedback(body: Partial<FeedbackSubmission>): string | null {
  if (!validTypes.includes(body.type as FeedbackType)) return "Invalid feedback type.";
  if (typeof body.message !== "string" || body.message.trim().length < 2) {
    return "Feedback message is required.";
  }
  if (body.message.length > 2000) return "Feedback message is too long.";
  if (body.rating !== undefined && (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)) {
    return "Rating must be between 1 and 5.";
  }
  if (body.type === "rating" && body.rating === undefined) return "Rating is required.";
  return null;
}

async function persistFeedback(submission: FeedbackSubmission) {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "feedback.jsonl"),
    `${JSON.stringify(submission)}\n`,
    "utf8"
  );
}

function sanitizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function sanitizeWallet(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return /^G[A-Z0-9]{55}$/.test(value) ? value : undefined;
}

function sanitizeMetadata(value: unknown): FeedbackSubmission["metadata"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const metadata: Record<string, string | number | boolean | null | undefined> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 12)) {
    const safeKey = key.slice(0, 40);
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean" || item === null) {
      metadata[safeKey] = item;
    } else {
      metadata[safeKey] = String(item).slice(0, 120);
    }
  }
  return metadata;
}
