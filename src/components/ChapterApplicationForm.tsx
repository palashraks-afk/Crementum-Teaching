"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitChapterApplication } from "@/server/actions";
import { EMPTY_STATE, GRADES } from "@/server/schema";
import { Honeypot, SelectField, TextArea, TextField } from "./Field";
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
          question
          name="firstName"
          label="First name"
          autoComplete="given-name"
          defaultValue={values.firstName}
          error={state.errors.firstName}
        />
        <TextField
          question
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          defaultValue={values.lastName}
          error={state.errors.lastName}
        />
      </div>

      <div className={styles.pair}>
        <TextField
          question
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          error={state.errors.email}
        />
        <TextField
          question
          name="contact"
          label="Email/Contact Information"
          defaultValue={values.contact}
          error={state.errors.contact}
        />
      </div>

      <div className={styles.pair}>
        <SelectField
          question
          name="grade"
          label="Grade for the 2026-2027 school year"
          placeholder="Select…"
          options={GRADES.map((g) => ({ value: g, label: g }))}
          defaultValue={values.grade}
          error={state.errors.grade}
        />
        <TextField
          question
          name="school"
          label="High School"
          defaultValue={values.school}
          error={state.errors.school}
        />
      </div>

      <TextField
        question
        name="schoolAddress"
        label="High School Address"
        defaultValue={values.schoolAddress}
        error={state.errors.schoolAddress}
      />

      <TextArea
        question
        name="motivation"
        label="What inspired you to apply to start a Crementum branch?"
        defaultValue={values.motivation}
        error={state.errors.motivation}
      />

      <TextArea
        question
        name="leadership"
        label="Describe your leadership and team management experience."
        defaultValue={values.leadership}
        error={state.errors.leadership}
      />

      <TextArea
        question
        name="existingTutoring"
        label="Does your school already have an established tutoring infrastructure? Please describe it below:"
        defaultValue={values.existingTutoring}
        error={state.errors.existingTutoring}
      />

      <TextArea
        question
        name="activities"
        label="Describe your other activities, with an approximate weekly time commitment."
        defaultValue={values.activities}
        error={state.errors.activities}
      />

      <TextField
        question
        name="clubDeadline"
        label={
          "When is your school's club registration deadline for the 2026-2027 school year? " +
          'Write "Already Passed" if it has passed, write "N/A" if you don\'t know.'
        }
        defaultValue={values.clubDeadline}
        error={state.errors.clubDeadline}
      />

      <TextArea
        question
        name="officers"
        label="Please provide the list of people who will be officers or part of the regional leadership at your school: (Name, Email)"
        defaultValue={values.officers}
        error={state.errors.officers}
      />

      <TextArea
        question
        name="questions"
        label="Do you have any questions, comments, concerns for us?"
        optional
        defaultValue={values.questions}
        error={state.errors.questions}
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
