"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { registerUser } from "@/server/actions";
import { EMPTY_STATE, type FormState } from "@/server/schema";
import { SignInButton } from "./AuthButtons";
import styles from "./AccountAuth.module.css";

type Mode = "signin" | "register";

export function AccountAuth({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [state, setState] = useState<FormState>(EMPTY_STATE);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    startTransition(async () => {
      if (mode === "register") {
        const result = await registerUser(EMPTY_STATE, form);
        if (!result.ok) {
          setState(result);
          return;
        }
      }

      const outcome = await signIn("credentials", { email, password, redirect: false });
      if (outcome?.error) {
        setState({ ok: false, errors: {}, message: "Wrong email or password." });
        return;
      }
      setState(EMPTY_STATE);
      router.refresh();
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist">
        {(["signin", "register"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            className={styles.tab}
            data-active={mode === value || undefined}
            onClick={() => {
              setMode(value);
              setState(EMPTY_STATE);
            }}
          >
            {value === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className={styles.form}>
        {mode === "register" ? (
          <label className={styles.field}>
            <span className={styles.label}>Name</span>
            <input name="name" className={styles.input} autoComplete="name" required />
            {state.errors.name ? <span className={styles.error}>{state.errors.name}</span> : null}
          </label>
        ) : null}

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            name="email"
            type="email"
            className={styles.input}
            autoComplete="email"
            required
          />
          {state.errors.email ? <span className={styles.error}>{state.errors.email}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            name="password"
            type="password"
            className={styles.input}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
          />
          {state.errors.password ? (
            <span className={styles.error}>{state.errors.password}</span>
          ) : null}
        </label>

        {state.message ? <p className={styles.error}>{state.message}</p> : null}

        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {googleEnabled ? (
        <>
          <p className={styles.divider}>or</p>
          <SignInButton />
        </>
      ) : null}
    </div>
  );
}
