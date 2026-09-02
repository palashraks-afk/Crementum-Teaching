import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ChapterApplicationForm } from "@/components/ChapterApplicationForm";
import styles from "./start.module.css";

export const metadata: Metadata = {
  title: "Start a Chapter",
  description: "Bring free peer tutoring to your school. Apply to run a Crementum Teaching chapter.",
};

const STAGES = [
  { when: "Week 1", title: "Apply", body: "Fill the form. We email you back." },
  { when: "Weeks 2–3", title: "Onboard", body: "You get the booking system and training docs." },
  { when: "Week 4", title: "Launch", body: "Recruit tutors. Take your first session." },
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
          <p className="eyebrow">Application</p>
          <h2 className={styles.formTitle}>Tell us about your region.</h2>
          <div className={styles.form}>
            <ChapterApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
