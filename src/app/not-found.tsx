import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section className={`band ${styles.wrap}`}>
      <div className="shell">
        <p className="eyebrow">404</p>
        <h1 className={styles.title}>That page is not in the index.</h1>
        <p className="lede">
          The link is dead or the page moved. The catalog and the request form are both one click
          away.
        </p>
        <div className={styles.actions}>
          <Link href="/" className="btn">
            Back to the catalog
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link href="/book" className="btn btn--ghost">
            Request a session
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
