"use client";

import { useActionState } from "react";
import { sendQuestion } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import type { DbBranch } from "@/server/db";
import { Honeypot, SelectField, TextArea, TextField } from "./Field";
import styles from "./Form.module.css";

export function QuestionForm({ branches }: { branches: DbBranch[] }) {
  const [state, formAction, pending] = useActionState(sendQuestion, EMPTY_STATE);
  const values = state.values ?? {};

  const options = [
    { value: "hq-office", label: "Head office" },
    ...branches.map((b) => ({ value: b.id, label: `${b.city}, ${b.region}` })),
  ];

  if (state.ok) {
    return (
      <div className={styles.done}>
        <p className="eyebrow">Sent</p>
        <h2 className={styles.doneTitle}>We have got your question.</h2>
        <p className={styles.doneBody}>Reply lands in your inbox, usually same day.</p>
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

      <SelectField
        name="sendTo"
        label="Ask"
        options={options}
        defaultValue={values.sendTo ?? "hq-office"}
        error={state.errors.sendTo}
      />

      <div className={styles.pair}>
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          defaultValue={values.name}
          error={state.errors.name}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          error={state.errors.email}
        />
      </div>

      <TextArea
        name="message"
        label="Question"
        placeholder="Do you cover IB Math AA?"
        defaultValue={values.message}
        error={state.errors.message}
      />

      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : "Send"}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
