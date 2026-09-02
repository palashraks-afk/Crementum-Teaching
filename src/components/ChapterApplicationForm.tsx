"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitChapterApplication } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import { Honeypot, TextArea, TextField } from "./Field";
import styles from "./Form.module.css";

export function ChapterApplicationForm() {
  const [state, formAction, pending] = useActionState(submitChapterApplication, EMPTY_STATE);
  const values = state.values ?? {};

  if (state.ok) {
    return (
      <div className={styles.done}>
        <p className="eyebrow">Application received</p>
        <h2 className={styles.doneTitle}>
          We read every one of these <span className="mark">ourselves</span>.
        </h2>
        <p className={styles.doneBody}>
          Someone from the leadership team will email you within a few days to talk through your
          region, how onboarding works, and what a first month usually looks like.
        </p>
        <Link href="/branches" className="btn btn--ghost">
          See where chapters already run
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <Honeypot />

      {state.message ? (
        <p className={styles.notice} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.pair}>
        <TextField
          name="firstName"
          label="First name"
          autoComplete="given-name"
          defaultValue={values.firstName}
          error={state.errors.firstName}
        />
        <TextField
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          defaultValue={values.lastName}
          error={state.errors.lastName}
        />
      </div>

      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@school.edu"
        defaultValue={values.email}
        error={state.errors.email}
      />

      <div className={styles.pair}>
        <TextField
          name="school"
          label="School or organization"
          placeholder="Redlands High School"
          defaultValue={values.school}
          error={state.errors.school}
        />
        <TextField
          name="region"
          label="Region you would cover"
          placeholder="Inland Empire, CA"
          defaultValue={values.region}
          error={state.errors.region}
        />
      </div>

      <TextArea
        name="motivation"
        label="Why you, and why there"
        hint="Who needs tutoring in your area and is not getting it? Tell us what you already know about that."
        placeholder="Two of the three high schools here cut their after-school tutoring last year…"
        defaultValue={values.motivation}
        error={state.errors.motivation}
      />

      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : "Send application"}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className={styles.note}>Reply usually within a few days.</p>
      </div>
    </form>
  );
}
