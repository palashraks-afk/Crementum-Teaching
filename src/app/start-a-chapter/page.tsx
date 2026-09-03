import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ChapterApplicationForm } from "@/components/ChapterApplicationForm";
import styles from "./start.module.css";

export const metadata: Metadata = {
  title: "Start a Chapter",
  description: "Bring free peer tutoring to your school. Apply to run a Crementum Teaching chapter.",
};

const STAGES = [
  { when: "Week 1", title: "Apply", body: "Fill the form and we email you back." },
  { when: "Weeks 2–3", title: "Onboard", body: "You get the booking system and training docs." },
  { when: "Week 4", title: "Launch", body: "Recruit tutors, then take your first session." },
];

/** The five-step tutoring loop a branch president would be running. */
const PROCEDURE = [
  "A student needs help with a subject.",
  "They book on this site, picking the subject and a date that works.",
  "Tutors watch the incoming requests and take the ones they can teach and are free for.",
  "The tutor emails the student to confirm the session.",
  "The student gets the help they came for.",
];

const ADVANTAGES = [
  {
    title: "Free",
    body: "Private tutoring runs $20 to $40 an hour. Ours is nothing, and always will be.",
  },
  {
    title: "Peer tutors",
    body: "Tutors sat the same class a year or two ago. Students ask them the questions they would not ask an adult.",
  },
  {
    title: "Student first",
    body: "The student picks the subject, the day, and how often they come back. Nobody assigns them a schedule.",
  },
];

export default function StartChapterPage() {
  return (
    <>
      <PageHeader
        variant="center"
        eyebrow="Start a chapter"
        title="Run this where you live."
        lede="You recruit tutors and reach students nearby. We handle the rest."
      />

      <section className="band band--tight">
        <div className="shell">
          <ol className={styles.stages}>
            {STAGES.map((stage) => (
              <li key={stage.title} className={styles.stage}>
                <p className={styles.stageWhen}>{stage.when}</p>
                <h2 className={styles.stageTitle}>{stage.title}</h2>
                <p className={styles.stageBody}>{stage.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--cream">
        <div className="shell">
          <p className="eyebrow">How Crementum works</p>
          <h2 className={styles.formTitle}>Five steps, start to finish.</h2>
          <p className={styles.lede}>
            Students sign up online and get paired with a tutor who is free and knows the subject.
            As a branch president you set that up where you live: recruiting tutors, telling people
            it exists, and keeping it running.
          </p>
          <ol className={styles.procedure}>
            {PROCEDURE.map((step, index) => (
              <li key={step} className={styles.procedureStep}>
                <span className={styles.procedureNum} aria-hidden="true">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <p className="eyebrow">Why students pick us</p>
          <h2 className={styles.formTitle}>What you would be offering.</h2>
          <dl className={styles.advantages}>
            {ADVANTAGES.map((item) => (
              <div key={item.title} className={styles.advantage}>
                <dt>{item.title}</dt>
                <dd>{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="band band--cream">
        <div className="shell">
          <p className="eyebrow">Application</p>
          <h2 className={styles.formTitle}>Tell us about your school.</h2>
          <p className={styles.lede}>
            Answers do not have to be long. We are reading for your reason for starting a branch and
            what you plan to do with it. Once we have read it we will email you about getting your
            tutors onto the booking system. If a subject you want to offer is not listed yet, say so
            in the last question.
          </p>
          <div className={styles.form}>
            <ChapterApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
