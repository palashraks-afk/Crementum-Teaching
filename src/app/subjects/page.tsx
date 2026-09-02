import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CORES, coursesInCore } from "@/content/catalog";
import { SITE } from "@/content/site";
import styles from "./subjects.module.css";

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "Every course Crementum tutors, grouped into math, science, humanities, and speech and debate. Pick one and request a session.",
};

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        variant="split"
        figure={SITE.stats.courses}
        eyebrow="Courses"
        title="Everything we can staff today."
        lede={
          <>
            This is the working list, not a wish list — every course here has tutors behind it
            right now. If yours is missing, ask anyway on the{" "}
            <Link href="/book" className="link">
              request form
            </Link>
            .
          </>
        }
      />

      {CORES.map((core, index) => {
        const courses = coursesInCore(core.id);
        return (
          <section
            key={core.id}
            id={core.id}
            className={`band band--tight ${styles.core}`}
            data-alt={index % 2 === 1 || undefined}
          >
            <div className={`shell ${styles.inner}`}>
              <div className={styles.intro}>
                <p className="eyebrow">{courses.length} courses</p>
                <h2 className={styles.coreTitle}>{core.name}</h2>
                <p className={styles.coreBlurb}>{core.blurb}</p>
              </div>

              <ul className={styles.courses}>
                {courses.map((course) => (
                  <li key={course.slug}>
                    <Link href={`/book?course=${course.slug}`} className={styles.course}>
                      <span>{course.name}</span>
                      <span className={styles.go} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="band band--dark">
        <div className="shell">
          <h2 className={styles.closeTitle}>
            Pick the one you have been avoiding.
          </h2>
          <Link href="/book" className="btn">
            Request a session
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
