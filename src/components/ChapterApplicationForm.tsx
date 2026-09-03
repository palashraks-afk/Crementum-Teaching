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

      <div className={styles.pair}>
        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          defaultValue={values.email}
          error={state.errors.email}
        />
        <TextField
          name="contact"
          label="Another way to reach you"
          optional
          hint="A phone number or a handle you check more often."
          defaultValue={values.contact}
          error={state.errors.contact}
        />
      </div>

      <div className={styles.pair}>
        <SelectField
          name="grade"
          label="Grade this school year"
          placeholder="Select…"
          options={GRADES.map((g) => ({ value: g, label: g }))}
          defaultValue={values.grade}
          error={state.errors.grade}
        />
        <TextField
          name="school"
          label="High school"
          placeholder="Redlands High School"
          defaultValue={values.school}
          error={state.errors.school}
        />
      </div>

      <TextField
        name="schoolAddress"
        label="School address"
        placeholder="840 E Citrus Ave, Redlands, CA 92374"
        defaultValue={values.schoolAddress}
        error={state.errors.schoolAddress}
      />

      <TextField
        name="region"
        label="Region you would cover"
        hint="The area your branch would serve, which may be wider than your school."
        placeholder="Inland Empire, CA"
        defaultValue={values.region}
        error={state.errors.region}
      />

      <TextArea
        name="motivation"
        label="What made you want to start a branch?"
        hint="Who needs tutoring near you and is not getting it? Tell us what you already know about that."
        placeholder="Two of the three high schools here cut their after-school tutoring last year…"
        defaultValue={values.motivation}
        error={state.errors.motivation}
      />

      <TextArea
        name="leadership"
        label="Your leadership and team management experience"
        defaultValue={values.leadership}
        error={state.errors.leadership}
      />

      <TextArea
        name="existingTutoring"
        label="Does your school already run tutoring?"
        hint="Describe it. If there is nothing, say so, that is a useful answer too."
        defaultValue={values.existingTutoring}
        error={state.errors.existingTutoring}
      />

      <TextArea
        name="activities"
        label="Your other activities, with rough hours per week"
        hint="Varsity basketball: 15 hours a week. Soup kitchen: 5 hours a week."
        defaultValue={values.activities}
        error={state.errors.activities}
      />

      <TextField
        name="clubDeadline"
        label="Your school's club registration deadline this year"
        hint='Write "Already passed" if it has gone, or "N/A" if you do not know.'
        defaultValue={values.clubDeadline}
        error={state.errors.clubDeadline}
      />

      <TextArea
        name="officers"
        label="Who else would be an officer?"
        hint="Name and email for each person, one per line."
        placeholder={"Jordan Reyes, jordan@…\nSam Okafor, sam@…"}
        defaultValue={values.officers}
        error={state.errors.officers}
      />

      <TextArea
        name="questions"
        label="Questions, comments or concerns"
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
