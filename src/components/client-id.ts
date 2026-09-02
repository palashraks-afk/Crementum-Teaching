const KEY = "crementum:client-id";

/**
 * A random id kept in this browser. It is how a student sees their own
 * bookings without an account, and why one person's bookings never show up
 * for anyone else, which looking them up by email would allow.
 */
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Private mode or blocked storage: bookings still submit, they just are
    // not listed back on this device.
    return "";
  }
}
