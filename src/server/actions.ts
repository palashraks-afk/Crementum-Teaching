"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { deleteBranch, getBranches, getDb, upsertBranch } from "./db";
import { notify } from "./mail";
import { allow, sweep } from "./rate-limit";
import { clearAdminSession, isAdmin, setAdminSession } from "./admin";
import { courseBySlug } from "@/content/catalog";
import {
  chapterApplicationSchema,
  fieldErrors,
  sessionRequestSchema,
  type FormState,
} from "./schema";

const RATE_LIMITED = "Too many requests. Wait a few minutes.";
const SAVE_FAILED = "Could not save. Try again or email crementumteaching@gmail.com.";

async function clientKey(scope: string): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || list.get("x-real-ip") || "local"}`;
}

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

function isBot(data: FormData): boolean {
  return text(data, "website").length > 0;
}

function keep(data: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, text(data, key)]));
}

export async function submitSessionRequest(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const values = keep(data, [
    "name",
    "email",
    "grade",
    "courseSlug",
    "courseLabel",
    "neededBy",
    "scheduledAt",
    "details",
  ]);

  if (isBot(data)) return { ok: true, errors: {} };

  const parsed = sessionRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values };
  }

  sweep();
  if (!allow(await clientKey("session"))) {
    return { ok: false, errors: {}, message: RATE_LIMITED, values };
  }

  const input = parsed.data;
  const clientId = text(data, "clientId").trim() || null;
  const course = input.courseSlug ? courseBySlug(input.courseSlug) : undefined;
  // The schema guarantees a slug or a typed label; prefer the catalog name.
  const courseLabel = (course?.name ?? input.courseLabel ?? "").trim() || "Unspecified course";

  try {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO session_requests
              (client_id, name, email, grade, course_slug, course_label, needed_by, details, scheduled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        clientId,
        input.name,
        input.email,
        input.grade || null,
        course?.slug ?? null,
        courseLabel,
        input.neededBy || null,
        input.details,
        input.scheduledAt || null,
      ],
    });
  } catch (error) {
    console.error("[crementum] session request failed", error);
    return { ok: false, errors: {}, message: SAVE_FAILED, values };
  }

  // So the Book page's pending/confirmed cards pick the new row up immediately.
  revalidatePath("/book");

  await notify({
    subject: `Session: ${courseLabel}`,
    replyTo: input.email,
    rows: [
      ["Student", input.name],
      ["Email", input.email],
      ["Course", courseLabel],
      ["Date", input.scheduledAt],
      ["Details", input.details],
    ],
  });

  return { ok: true, errors: {} };
}

export async function submitChapterApplication(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const values = keep(data, [
    "firstName",
    "lastName",
    "email",
    "school",
    "region",
    "motivation",
  ]);

  if (isBot(data)) return { ok: true, errors: {} };

  const parsed = chapterApplicationSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values };
  }

  sweep();
  if (!allow(await clientKey("chapter"))) {
    return { ok: false, errors: {}, message: RATE_LIMITED, values };
  }

  const input = parsed.data;

  try {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO chapter_applications
              (first_name, last_name, email, school, region, motivation)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        input.firstName,
        input.lastName,
        input.email,
        input.school,
        input.region,
        input.motivation,
      ],
    });
  } catch (error) {
    console.error("[crementum] chapter application failed", error);
    return { ok: false, errors: {}, message: SAVE_FAILED, values };
  }

  await notify({
    subject: `Chapter: ${input.region}`,
    replyTo: input.email,
    rows: [
      ["Name", `${input.firstName} ${input.lastName}`],
      ["Email", input.email],
      ["School", input.school],
      ["Region", input.region],
      ["Why", input.motivation],
    ],
  });

  return { ok: true, errors: {} };
}

export async function adminLogin(_prev: FormState, data: FormData): Promise<FormState> {
  const password = text(data, "password");
  const ok = await setAdminSession(password);
  if (!ok) return { ok: false, errors: { password: "Wrong password." } };
  return { ok: true, errors: {} };
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
}

/** Bookings made from this browser, identified by its random client id. */
export async function getClientBookings(clientId: string) {
  if (!clientId) return [];
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT id, course_label, needed_by, status, created_at, scheduled_at, grade, details
          FROM session_requests WHERE client_id = ? ORDER BY created_at DESC LIMIT 20`,
    args: [clientId],
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    course: String(row.course_label),
    when: String(row.needed_by ?? ""),
    status: String(row.status),
    createdAt: String(row.created_at),
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    grade: row.grade ? String(row.grade) : null,
    details: String(row.details ?? ""),
  }));
}

export async function checkAdmin(): Promise<boolean> {
  return isAdmin();
}

/* -------------------------------------------------------- admin: branches -- */

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function saveBranch(_prev: FormState, data: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { ok: false, errors: {}, message: "Admin only." };

  const city = text(data, "city").trim();
  const region = text(data, "region").trim();
  const country = text(data, "country").trim() || "USA";
  const lat = Number(text(data, "lat"));
  const lng = Number(text(data, "lng"));
  const id = text(data, "id").trim() || slugify(`${city}-${region}`);

  const errors: Record<string, string> = {};
  if (city.length < 2) errors.city = "City is required.";
  if (region.length < 2) errors.region = "Region is required.";
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.lat = "Latitude between -90 and 90.";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.lng = "Longitude between -180 and 180.";
  if (Object.keys(errors).length) return { ok: false, errors };

  await upsertBranch({
    id,
    city,
    region,
    country,
    lat,
    lng,
    hq: text(data, "hq") === "on",
    school: text(data, "school").trim() || null,
    lead: text(data, "lead").trim() || null,
    contactEmail: text(data, "contactEmail").trim() || null,
    founded: text(data, "founded").trim() || null,
    about: text(data, "about").trim() || null,
  });

  revalidatePath("/branches");
  revalidatePath("/admin");
  return { ok: true, errors: {} };
}

export async function removeBranch(_prev: FormState, data: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { ok: false, errors: {}, message: "Admin only." };

  const id = text(data, "id").trim();
  if (!id) return { ok: false, errors: {}, message: "Missing branch id." };

  await deleteBranch(id);
  revalidatePath("/branches");
  revalidatePath("/admin");
  return { ok: true, errors: {} };
}

/* ------------------------------------------------------------- contact -- */

/** A question routed to one branch, or to the head office. */
export async function sendQuestion(_prev: FormState, data: FormData): Promise<FormState> {
  const values = keep(data, ["name", "email", "sendTo", "message"]);
  if (isBot(data)) return { ok: true, errors: {} };

  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) errors.email = "Check the email.";
  if (!values.sendTo) errors.sendTo = "Pick who to ask.";
  if (values.message.trim().length < 10) errors.message = "A sentence or two.";
  if (Object.keys(errors).length) return { ok: false, errors, values };

  sweep();
  if (!allow(await clientKey("question"))) {
    return { ok: false, errors: {}, message: RATE_LIMITED, values };
  }

  // Resolve the branch id to a readable name for the notification subject.
  let destination = "Head office";
  if (values.sendTo !== "hq-office") {
    const branches = await getBranches();
    const branch = branches.find((b) => b.id === values.sendTo);
    destination = branch ? `${branch.city}, ${branch.region}` : values.sendTo;
  }

  try {
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO contact_messages (name, email, send_to, message)
            VALUES (?, ?, ?, ?)`,
      args: [values.name.trim(), values.email.trim().toLowerCase(), values.sendTo, values.message.trim()],
    });
  } catch (error) {
    console.error("[crementum] question failed", error);
    return { ok: false, errors: {}, message: SAVE_FAILED, values };
  }

  await notify({
    subject: `Question: ${destination}`,
    replyTo: values.email.trim(),
    rows: [
      ["From", values.name.trim()],
      ["Email", values.email.trim()],
      ["To", destination],
      ["Message", values.message.trim()],
    ],
  });

  return { ok: true, errors: {} };
}
