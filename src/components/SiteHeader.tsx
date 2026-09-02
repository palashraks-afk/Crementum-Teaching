"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/content/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header} data-open={open || undefined}>
      <div className={`shell ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          <Logo size={36} showText={false} />
          <span className={styles.brandText}>
            Crementum
            <span className={styles.brandSub}>Teaching</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Balances the wordmark's track so the nav lands dead centre. */}
        <span className={styles.spacer} aria-hidden="true" />

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div id="mobile-nav" className={styles.drawer} hidden={!open}>
        <div className="shell">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.drawerLink}>
              {item.label}
            </Link>
          ))}
          <Link href="/book" className={styles.drawerLink}>
            Book Free Session
          </Link>
        </div>
      </div>
    </header>
  );
}
