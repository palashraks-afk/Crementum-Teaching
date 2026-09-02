import Link from "next/link";
import { AnimatedIn, AnimatedItem } from "@/components/AnimatedIn";
import { CourseIndex } from "@/components/CourseIndex";
import { SITE, RECOGNITION } from "@/content/site";
import styles from "./home.module.css";

const STEPS = [
  { title: "Request", body: "Name your class. Done in 30 seconds." },
  { title: "Match", body: "A tutor reaches out within hours." },
  { title: "Learn", body: "45–60 min, just you and your tutor." },
];

const WHY = [
  { title: "Free", body: "Always. No catch." },
  { title: "1-on-1", body: "Your pace. Your subject." },
  { title: "On-demand", body: "Book anytime, even night-before." },
];

export default function HomePage() {
  return (
    <>
      <section className={`band ${styles.hero}`}>
        <div className="shell">
          <AnimatedIn>
            <p className="eyebrow">Free · 501(c)(3)</p>
            <h1 className={styles.headline}>
              Learning
              <br />
              <span className="mark">Unlocked</span>
            </h1>
            <p className={styles.sub}>Free 1-on-1 tutoring. Math, Science, Humanities & Speech.</p>
            <div className={styles.actions}>
              <Link href="/book" className="btn">
                Book Free Session
              </Link>
              <Link href="/about" className="link">
                Our Story
              </Link>
            </div>
          </AnimatedIn>

          <AnimatedIn className={styles.stats} delay={0.1}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{SITE.stats.sessions}</span>
              <span className={styles.statLabel}>Sessions</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{SITE.stats.courses}</span>
              <span className={styles.statLabel}>Courses</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Free</span>
            </div>
          </AnimatedIn>

          <AnimatedIn className={styles.index}>
            <CourseIndex label="Find your class" />
          </AnimatedIn>
        </div>
      </section>

      <section className="band band--cream">
        <div className="shell">
          <AnimatedIn stagger className={styles.steps}>
            {STEPS.map((s) => (
              <AnimatedItem key={s.title} className={styles.step}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </AnimatedItem>
            ))}
          </AnimatedIn>
        </div>
      </section>

      <section className="band">
        <div className={`shell ${styles.about}`}>
          <AnimatedIn className={styles.aboutMedia}>
            <figure className={styles.photo}>
              <img
                src="/about-students.avif"
                alt="Three Crementum students working together at a table with laptops"
                width={740}
                height={493}
                loading="lazy"
              />
            </figure>
          </AnimatedIn>

          <AnimatedIn className={styles.aboutText} delay={0.1}>
            <p className="eyebrow">About us</p>
            <h2 className={styles.aboutTitle}>Students teaching students.</h2>
            <p className={styles.aboutBody}>
              We are a 501(c)(3) run by students. Our tutors sat the same classes, with the same
              textbooks, a year or two ahead of you, so they know the parts that trip people up.
            </p>
            <p className={styles.aboutBody}>Every session is free. There is nothing to pay, ever.</p>
            <Link href="/about" className="link">
              More about us
            </Link>
          </AnimatedIn>
        </div>
      </section>

      <section className="band band--dark">
        <div className="shell">
          <AnimatedIn>
            <p className="eyebrow">Why Crementum Teaching</p>
            <h2 className={styles.sectionTitle}>Tutoring, simplified.</h2>
          </AnimatedIn>
          <AnimatedIn stagger className={styles.why} delay={0.1}>
            {WHY.map((w) => (
              <AnimatedItem key={w.title} className={styles.whyCard}>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </AnimatedItem>
            ))}
          </AnimatedIn>
        </div>
      </section>

      <section className="band band--tight">
        <div className="shell">
          <AnimatedIn className={styles.recognition}>
            {RECOGNITION.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </AnimatedIn>
        </div>
      </section>

      <section className={`band ${styles.close}`}>
        <div className="shell">
          <AnimatedIn>
            <h2 className={styles.closeTitle}>Ready?</h2>
            <Link href="/book" className="btn">
              Book Free Session
            </Link>
          </AnimatedIn>
        </div>
      </section>
    </>
  );
}
