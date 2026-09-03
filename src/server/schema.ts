import { z } from "zod";

/** Error text is shown directly under the field, so it says what to do next. */
const name = z
  .string()
  .trim()
  .min(2, "Enter your name so a tutor knows who they are meeting.")
  .max(80, "That is longer than we can store. Shorten it.");

const email = z
  .string()
  .trim()
  .min(1, "We reply by email, so we need one that works.")
  .email("That address is missing something. Check for a typo.")
  .max(160);

export const sessionRequestSchema = z
  .object({
    name,
    email,
    grade: z.string().trim().max(40).optional().or(z.literal("")),
    courseSlug: z.string().trim().max(80).optional().or(z.literal("")),
    // Optional on its own, picking from the dropdown is enough. The refine
    // below requires one of the two, so choosing a course no longer trips a
    // "name the class" error on a field the student never needed to touch.
    courseLabel: z.string().trim().max(120).optional().or(z.literal("")),
    neededBy: z.string().trim().max(60).optional().or(z.literal("")),
    // Required: students pick an actual day rather than a vague "this week".
    scheduledAt: z
      .string()
      .trim()
      .min(1, "Pick a date.")
      .refine((v) => !Number.isNaN(Date.parse(v)), "That date isn't valid.")
      .refine((v) => {
        const picked = new Date(v);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return picked >= today;
      }, "Pick today or a day after."),
    details: z
      .string()
      .trim()
      .min(10, "Give us a sentence or two: the topic, the assignment, or the test date.")
      .max(2000, "Keep it under 2000 characters."),
  })
  .superRefine((value, ctx) => {
    const hasSlug = Boolean(value.courseSlug?.trim());
    const hasLabel = (value.courseLabel?.trim().length ?? 0) >= 2;
    if (!hasSlug && !hasLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["courseSlug"],
        message: "Pick a course, or type it below.",
      });
    }
  });

/** Long-answer question. Short enough to answer in a sitting, long enough to say something. */
function essay(missing: string) {
  return z.string().trim().min(20, missing).max(2000, "Keep it under 2000 characters.");
}

export const GRADES = ["9th", "10th", "11th", "12th"] as const;

export const chapterApplicationSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  /** Anything other than email: a phone number, or a handle they check more. */
  contact: z.string().trim().max(160).optional().or(z.literal("")),
  grade: z.enum(GRADES, { errorMap: () => ({ message: "Pick your grade." }) }),
  school: z
    .string()
    .trim()
    .min(2, "Tell us the school this branch would run out of.")
    .max(120),
  schoolAddress: z
    .string()
    .trim()
    .min(6, "Street, city and state is enough.")
    .max(200),
  region: z
    .string()
    .trim()
    .min(2, "Name the city and state you would cover.")
    .max(120),
  motivation: essay("A few sentences on what made you want to start a branch."),
  leadership: essay("Tell us where you have led a team, in or out of school."),
  existingTutoring: essay(
    "Describe what your school already runs, or say plainly that it runs nothing.",
  ),
  activities: essay("List them with rough hours per week, so we know what your load looks like."),
  clubDeadline: z
    .string()
    .trim()
    .min(2, 'A date, "Already passed", or "N/A".')
    .max(120),
  officers: essay("Name and email for each person, one per line."),
  questions: z.string().trim().max(2000, "Keep it under 2000 characters.").optional().or(z.literal("")),
});

export type SessionRequest = z.infer<typeof sessionRequestSchema>;
export type ChapterApplication = z.infer<typeof chapterApplicationSchema>;

export type FormState = {
  ok: boolean;
  /** Field name → first error message. Empty when the submission succeeded. */
  errors: Record<string, string>;
  /** Shown above the form for problems that are not tied to one field. */
  message?: string;
  values?: Record<string, string>;
};

export const EMPTY_STATE: FormState = { ok: false, errors: {} };

/** Collapses a ZodError into the one message per field that the form renders. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
