"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminLogin } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import styles from "./AccountAuth.module.css";

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(adminLogin, EMPTY_STATE);
  const router = useRouter();

  // The page is a server component, so re-render it once the cookie is set.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={formAction} className={styles.form} style={{ maxWidth: "20rem" }}>
      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          name="password"
          type="password"
          className={styles.input}
          autoComplete="current-password"
          required
        />
        {state.errors.password ? (
          <span className={styles.error}>{state.errors.password}</span>
        ) : null}
      </label>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
