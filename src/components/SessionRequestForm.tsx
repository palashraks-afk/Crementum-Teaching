"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitSessionRequest } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import { CORES, CORE_BY_ID, COURSES, courseBySlug, type CoreId } from "@/content/catalog";
import { Honeypot, SelectField, TextArea, TextField } from "./Field";
import styles from "./Form.module.css";

const GRADES = ["6th", "7th", "8th", "9th", "10th", "11th", "12th", "College", "Other"].map(
  (value) => ({ value, label: value }),
);

/** Local today in YYYY-MM-DD, so the picker can't offer a past day. */
function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Guests get their details remembered locally so a second booking is faster. */
const STORE_KEY = "crementum:contact";

type Props = {
  defaultName?: string | null;
  defaultEmail?: string | null;
};

export function SessionRequestForm({ defaultName, defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState(submitSessionRequest, EMPTY_STATE);
  const params = useSearchParams();
  const router = useRouter();

  // Pull the newly-created booking into the cards above without a manual reload.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  const requested = params.get("course") ?? "";
  const preselected = courseBySlug(requested);

  const [filter, setFilter] = useState<CoreId | "all">(preselected?.core ?? "all");
  const [remembered, setRemembered] = useState<{ name: string; email: string } | null>(null);

  // Signed-in details win; otherwise fall back to whatever was saved locally.
  useEffect(() => {
    if (defaultName && defaultEmail) return;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setRemembered(JSON.parse(raw));
    } catch {
      /* ignore unreadable storage */
    }
  }, [defaultName, defaultEmail]);

  const courseOptions = useMemo(
    () =>
      COURSES.filter((course) => filter === "all" || course.core === filter).map((course) => ({
        value: course.slug,
        label: `${course.name} · ${CORE_BY_ID[course.core].name}`,
      })),
    [filter],
  );

  const values = state.values ?? {};
  const nameValue = values.name ?? defaultName ?? remembered?.name ?? "";
  const emailValue = values.email ?? defaultEmail ?? remembered?.email ?? "";
  const today = todayISO();

  function remember(form: FormData) {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") }),
      );
    } catch {
      /* storage may be blocked; not worth failing the booking over */
    }
  }

  if (state.ok) {
    return (
      <div className={styles.done}>
        <p className="eyebrow">Request received</p>
        <h2 className={styles.doneTitle}>
          {defaultName ? `Thanks, ${defaultName.split(" ")[0]}.` : "It's in."} Watch your email.
        </h2>
        <p className={styles.doneBody}>
          It's in the list above as Pending. A tutor reaches out to set a time, usually within
          hours.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => window.location.reload()}
        >
          Book another
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    );
  }

  return (
    <form
      action={(form) => {
        remember(form);
        return formAction(form);
      }}
      className={styles.form}
      noValidate
    >
      <Honeypot />

      {state.message ? (
        <p className={styles.notice} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.filters}>
        <span className={styles.filterLabel}>Filter</span>
        {(["all", ...CORES.map((c) => c.id)] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={styles.filterChip}
            data-active={filter === id || undefined}
            onClick={() => setFilter(id as CoreId | "all")}
          >
            {id === "all" ? "All" : CORE_BY_ID[id as CoreId].name}
          </button>
        ))}
      </div>

      <SelectField
        name="courseSlug"
        label="Course"
        placeholder={`Pick from ${courseOptions.length}`}
        options={courseOptions}
        defaultValue={values.courseSlug ?? preselected?.slug ?? ""}
        error={state.errors.courseSlug}
      />

      <div className={styles.pair}>
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          defaultValue={nameValue}
          error={state.errors.name}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={emailValue}
          error={state.errors.email}
        />
      </div>

      <div className={styles.pair}>
        <SelectField
          name="grade"
          label="Grade"
          optional
          placeholder="Select"
          options={GRADES}
          defaultValue={values.grade}
          error={state.errors.grade}
        />
        <TextField
          name="scheduledAt"
          label="Date you want it"
          type="date"
          min={today}
          defaultValue={values.scheduledAt}
          error={state.errors.scheduledAt}
        />
      </div>

      <TextField
        name="courseLabel"
        label="Or type the class"
        hint="Use this if it is not in the list."
        placeholder="Honors Precalc, period 3"
        defaultValue={values.courseLabel ?? preselected?.name ?? ""}
        error={state.errors.courseLabel}
      />

      <TextArea
        name="details"
        label="What do you want to work on"
        placeholder="Unit 4 related rates. Test Friday."
        defaultValue={values.details}
        error={state.errors.details}
      />

      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : "Send request"}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className={styles.note}>No card. No cost.</p>
      </div>
    </form>
  );
}
