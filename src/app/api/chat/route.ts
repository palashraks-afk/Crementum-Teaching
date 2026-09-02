import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { isAdmin } from "@/server/admin";
import { getBranches, getDb } from "@/server/db";
import { allow, sweep } from "@/server/rate-limit";
import { COURSES, CORES, CORE_BY_ID, courseBySlug } from "@/content/catalog";
import { FAQ, SITE } from "@/content/site";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional(),
  /** Path the student is on, so the assistant can answer "where am I". */
  page: z.string().max(120).optional(),
});

const catalogByCore = CORES.map(
  (core) =>
    `${core.name}: ${COURSES.filter((c) => c.core === core.id)
      .map((c) => c.name)
      .join(", ")}`,
).join("\n");

const faq = FAQ.map((f) => `Q: ${f.q} A: ${f.a}`).join("\n");

function systemPrompt(page: string | undefined, branchList: string) {
  return `You are the assistant for ${SITE.name}, a student-run 501(c)(3) that gives free one-on-one tutoring.

## Voice
Talk like a helpful student who works here. Short — usually 1 to 3 sentences. No bullet lists unless you are naming courses. No emoji. Never say "I'd be happy to", "Great question", "Absolutely", or "Let me help you with that". Just answer.

## What is true
- Every session is free. There is no paid tier, no trial, no card. If someone asks about price, the answer is zero.
- Tutors are students, usually a year or two ahead, screened for the subjects they teach.
- Sessions are one-on-one and online, 45 to 60 minutes.
- Most requests are matched within a few hours. Booking the night before a test is normal.
- ${SITE.stats.sessions} sessions run so far.
- Never state a branch count. If asked how many branches there are, point them at /branches and let the map answer.
- Contact: ${SITE.email}, ${SITE.instagramHandle}.

## Courses we cover
${catalogByCore}

## Branches
${branchList}

## Common questions
${faq}

## Where things are on the site
- /book — book a session, see pending and confirmed classes
- /subjects — full course list
- /branches — map of branches
- /start-a-chapter — apply to run a branch
- /contact — send a question to a branch or the head office
${page ? `\nThe student is currently on ${page}.` : ""}

## Booking
You can book for them with the book_session tool. You need their name, email, the course, and one line on what they are stuck on. Ask for whatever is missing — one or two questions at a time, not all at once. Never invent any of these values. After booking, tell them to watch their email.

If they would rather do it themselves, point them at /book.

## Limits
Never invent tutor names, prices, schedules, or statistics. If you do not know, say so and point at ${SITE.email}. If someone asks for homework answers, help them work it out or steer them to a session — do not just hand over answers.`;
}

const tools: Anthropic.Tool[] = [
  {
    name: "find_courses",
    description:
      "Search the tutoring catalog. Use when the student names a subject or is unsure whether something is covered.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Subject or course name, e.g. 'calculus' or 'apush'" },
      },
      required: ["query"],
    },
  },
  {
    name: "book_session",
    description:
      "Create a tutoring request. Only call once you have the student's real name, email, course, and what they need help with — never guess these.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        course: { type: "string", description: "Course name as the student said it" },
        details: { type: "string", description: "What they are stuck on" },
        when: { type: "string", description: "Tonight, This week, No rush, etc." },
        grade: { type: "string" },
      },
      required: ["name", "email", "course", "details"],
    },
  },
];

function normalize(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === "find_courses") {
    const q = normalize(String(input.query ?? ""));
    const hits = COURSES.filter((c) =>
      [c.name, ...(c.aka ?? []), CORE_BY_ID[c.core].name].some((v) => normalize(v).includes(q)),
    ).slice(0, 8);
    if (hits.length === 0) return "No match in the catalog. They can still request it — we try to staff it.";
    return hits.map((c) => `${c.name} (${CORE_BY_ID[c.core].name})`).join("; ");
  }

  if (name === "book_session") {
    const name_ = String(input.name ?? "").trim();
    const email = String(input.email ?? "").trim().toLowerCase();
    const course = String(input.course ?? "").trim();
    const details = String(input.details ?? "").trim();

    if (!name_ || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !course || details.length < 5) {
      return "Not booked — name, a valid email, course, and a sentence on the problem are all required. Ask for whatever is missing.";
    }

    const matched = COURSES.find((c) => normalize(c.name) === normalize(course));
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO session_requests (name, email, course_slug, course_label, needed_by, details, grade)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name_,
        email,
        matched?.slug ?? null,
        matched?.name ?? course,
        input.when ? String(input.when) : null,
        details,
        input.grade ? String(input.grade) : null,
      ],
    });
    return `Booked. ${matched?.name ?? course} for ${name_}. Confirmation goes to ${email}; a tutor claims it usually within hours.`;
  }

  return "Unknown tool.";
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({
      reply:
        "I'm offline right now — use the Book a Session tab, or email crementumteaching@gmail.com.",
    });
  }

  // The booking tool writes rows, so cap how fast one visitor can drive it.
  sweep();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";
  if (!allow(`chat:${ip}`)) {
    return NextResponse.json({ reply: "Slow down a moment, then try again." });
  }

  const client = new Anthropic({ apiKey: key });
  const branches = await getBranches();
  const branchList = branches.map((b) => `${b.city}, ${b.region}${b.hq ? " (HQ)" : ""}`).join("; ");

  const messages: Anthropic.MessageParam[] = [
    ...(parsed.data.history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: parsed.data.message },
  ];

  try {
    // Agentic loop: keep going while Claude asks for tools. Capped so a bad
    // turn can never spin.
    for (let i = 0; i < 5; i++) {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 1024,
        // Low effort keeps the bubble snappy. Thinking stays on — disabling it
        // on Opus 5 can emit tool calls as plain text that never run.
        output_config: { effort: "low" },
        system: systemPrompt(parsed.data.page, branchList),
        tools,
        messages,
      });

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type === "tool_use") {
            const output = await runTool(block.name, block.input as Record<string, unknown>);
            results.push({ type: "tool_result", tool_use_id: block.id, content: output });
          }
        }
        messages.push({ role: "user", content: results });
        continue;
      }

      const text = response.content.find((b) => b.type === "text");
      return NextResponse.json({
        reply: text?.type === "text" ? text.text : "Say that again?",
      });
    }

    return NextResponse.json({ reply: "That got tangled. Try the Book a Session tab." });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json({
      reply: "Something broke. Use the Book a Session tab, or email crementumteaching@gmail.com.",
    });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const schema = z.object({
    id: z.string().min(1).max(40),
    city: z.string().min(1).max(80),
    region: z.string().min(1).max(80),
    country: z.string().min(1).max(80).default("USA"),
    lat: z.number(),
    lng: z.number(),
    hq: z.boolean().optional(),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid branch data" }, { status: 400 });
  }

  const b = parsed.data;
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO branches (id, city, region, country, lat, lng, hq)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            city=excluded.city, region=excluded.region, country=excluded.country,
            lat=excluded.lat, lng=excluded.lng, hq=excluded.hq`,
    args: [b.id, b.city, b.region, b.country, b.lat, b.lng, b.hq ? 1 : 0],
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM branches WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
