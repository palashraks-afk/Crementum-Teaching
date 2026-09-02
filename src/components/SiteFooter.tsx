import Link from "next/link";
import { Logo } from "./Logo";
import { SITE, NAV } from "@/content/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.lead}>
          <div className={styles.brand}>
            <Logo size={32} showText={false} />
            <p className={styles.wordmark}>Crementum Teaching</p>
          </div>
          <p className={styles.mission}>
            501(c)(3) · Free 1-on-1 tutoring · {SITE.stats.courses} courses
          </p>
          <Link href="/book" className="btn">
            Book a Session
          </Link>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          <ul className={styles.list}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div>
            <a href={`mailto:${SITE.email}`} className={styles.link}>
              {SITE.email}
            </a>
            <br />
            <a
              href={SITE.instagram}
              className={styles.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              {SITE.instagramHandle}
            </a>
          </div>
        </nav>
      </div>

      <div className={`shell ${styles.base}`}>
        <p>© {new Date().getFullYear()} Crementum Teaching</p>
      </div>
    </footer>
  );
}
