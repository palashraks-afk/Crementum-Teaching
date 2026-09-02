import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TeamGrid } from "@/components/TeamGrid";
import { RECOGNITION, SITE } from "@/content/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Crementum Teaching is a student-run 501(c)(3). Free one-on-one tutoring, no fees at any point.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Free tutoring, run by students."
        lede="No fees, no trial, no catch."
      />

      <section className="band band--tight">
        <div className={`shell ${styles.grid}`}>
          <div className={styles.prose}>
            {/*
              TODO for the Crementum team: swap in the real founding story —
              who started it, which school, what year.
            */}
            <p>
              Tutoring usually costs $40 to $100 an hour. A lot of students who need it just go
              without.
            </p>
            <p>
              We are a 501(c)(3) nonprofit. Every session is free, in every subject we cover.
              Donations pay for what we run on. We never bill a student.
            </p>
            <p>
              Our tutors are students too, most of them a year or two ahead of you. They sat the
              same class with the same textbook, so they know which parts trip people up. Each
              tutor is checked on the subjects they sign up to teach.
            </p>
            <p>
              Sessions are one on one and online. You get the whole hour, and you can be matched
              with a tutor from any branch, not just the one nearest you.
            </p>
            <p>
              A branch is a group of students at one school who recruit tutors and spread the word
              locally.{" "}
              <Link href="/branches" className="link">
                See the map
              </Link>{" "}
              or{" "}
              <Link href="/start-a-chapter" className="link">
                start one
              </Link>
              .
            </p>
          </div>

          <aside className={styles.facts}>
            <div className={styles.factBlock}>
              <p className="eyebrow">Numbers</p>
              <dl className={styles.factList}>
                <div>
                  <dt>Sessions</dt>
                  <dd>{SITE.stats.sessions}</dd>
                </div>
                <div>
                  <dt>Branches</dt>
                  <dd>{SITE.stats.branches}</dd>
                </div>
                <div>
                  <dt>Courses</dt>
                  <dd>{SITE.stats.courses}</dd>
                </div>
                <div>
                  <dt>Cost</dt>
                  <dd>$0</dd>
                </div>
              </dl>
            </div>

            <div className={styles.factBlock}>
              <p className="eyebrow">Recognized by</p>
              <ul className={styles.recognition}>
                {RECOGNITION.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="band band--tight band--cream">
        <div className="shell">
          <p className="eyebrow">Our team</p>
          <h2 className={styles.teamTitle}>The people running it.</h2>
          <TeamGrid />
        </div>
      </section>

      <section className="band band--tight band--dark">
        <div className={`shell ${styles.close}`}>
          <h2 className={styles.closeTitle}>Book one. It costs nothing.</h2>
          <Link href="/dashboard" className="btn">
            Book a session
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
