import type { Metadata } from "next";
import { BookWorkspace } from "@/components/BookWorkspace";
import { Logo } from "@/components/Logo";
import styles from "./book.module.css";

export const metadata: Metadata = {
  title: "Book a Session",
  description: "Book a free one-on-one tutoring session. Always free.",
};

const STEPS = [
  { title: "Pick your class", body: "Choose from the list, or type it yourself." },
  { title: "Say what you're stuck on", body: "One or two sentences is enough." },
  { title: "Watch your email", body: "A tutor reaches out, usually within hours." },
];

export default function BookPage() {
  return (
    <>
      <div className={styles.bar}>
        <div className={`shell ${styles.barInner}`}>
          <span className={styles.barBrand}>
            <Logo size={22} showText={false} />
            Book a Session
          </span>
          <span className={styles.barNote}>Always free</span>
        </div>
      </div>

      <section className="band band--tight band--cream">
        <div className="shell">
          <p className="eyebrow">How it works</p>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNum}>{index + 1}</span>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--tight">
        <div className="shell">
          <BookWorkspace />
        </div>
      </section>
    </>
  );
}
