const KEY = "crementum:branch-draft";

/** Never stored: the bot trap and React's own server-action plumbing. */
const SKIP = /^(website|\$ACTION)/;

export type Draft = { savedAt: string; values: Record<string, string> };

/**
 * The application is long enough that people will not finish it in one sitting.
 * The draft lives in this browser only, so it never reaches the server and
 * never needs an account to come back to.
 */
export function saveDraft(form: HTMLFormElement): Draft | null {
  const values: Record<string, string> = {};
  for (const [name, value] of new FormData(form).entries()) {
    if (SKIP.test(name) || typeof value !== "string") continue;
    if (value.trim()) values[name] = value;
  }
  if (Object.keys(values).length === 0) return null;

  const draft: Draft = { savedAt: new Date().toISOString(), values };
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    return null;
  }
  return draft;
}

export function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    return parsed && typeof parsed === "object" && parsed.values ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* Storage can be blocked; there is nothing useful to do about it. */
  }
}

/** Writes saved answers back into fields the visitor has not already filled. */
export function applyDraft(form: HTMLFormElement, draft: Draft): void {
  for (const [name, value] of Object.entries(draft.values)) {
    const field = form.elements.namedItem(name);
    if (
      (field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement) &&
      !field.value
    ) {
      field.value = value;
    }
  }
}
