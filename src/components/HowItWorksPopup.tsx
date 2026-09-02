"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import styles from "./HowItWorksPopup.module.css";

const KEY = "crementum:hiw-dismissed";

/**
 * Once a student has booked once, the full "How it works" block is replaced by
 * this — parked bottom-left (the chat launcher owns bottom-right), collapsed,
 * and dismissible for good.
 */
export function HowItWorksPopup({ steps }: { steps: { title: string; body: string }[] }) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(true);

  // Read on mount only, so the server render and first paint agree.
  useEffect(() => {
    setGone(localStorage.getItem(KEY) === "1");
  }, []);

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setGone(true);
  }

  if (gone) return null;

  return (
    <div className={styles.dock}>
      <AnimatePresence>
        {open ? (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.head}>
              <Logo size={18} showText={false} />
              <strong className={styles.title}>How it works</strong>
              <button type="button" className={styles.x} onClick={dismiss} aria-label="Don't show again">
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ol className={styles.steps}>
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className={styles.num}>{i + 1}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <span className={styles.body}>{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className={styles.tab}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Logo size={16} showText={false} />
        How it works
        <span className={styles.caret} data-open={open || undefined} aria-hidden="true">
          ▾
        </span>
      </button>
    </div>
  );
}
