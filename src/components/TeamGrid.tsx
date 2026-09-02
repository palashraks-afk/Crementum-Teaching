"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { TEAM } from "@/content/site";
import styles from "./TeamGrid.module.css";

function Portrait({ photo, name }: { photo: string; name: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} className={styles.photo} />;
  }
  return (
    <svg viewBox="0 0 64 64" className={styles.silhouette} aria-hidden="true">
      <circle cx="32" cy="24" r="11" />
      <path d="M11 60c0-11.6 9.4-21 21-21s21 9.4 21 21" />
    </svg>
  );
}

export function TeamGrid() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className={styles.grid}>
        {TEAM.map((member, index) => {
          const named = Boolean(member.name);
          const expanded = open === index;

          return (
            <li key={`${member.role}-${index}`} className={styles.card}>
              <button
                type="button"
                className={styles.trigger}
                // A blank slot has nothing to open.
                disabled={!named || member.bio.length === 0}
                aria-expanded={named ? expanded : undefined}
                onClick={() => setOpen(expanded ? null : index)}
              >
                <span className={styles.portrait} data-open={expanded || undefined}>
                  <Portrait photo={member.photo} name={member.name || member.role} />
                </span>
                <span className={styles.name} data-empty={!named || undefined}>
                  {member.name || " "}
                </span>
                <span className={styles.role}>{member.role}</span>
                {named && member.bio.length > 0 ? (
                  <span className={styles.more}>{expanded ? "Close" : "Read bio"}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false}>
        {open !== null && TEAM[open]?.bio.length ? (
          <motion.article
            key={open}
            className={styles.bio}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <div className={styles.bioInner}>
              <header className={styles.bioHead}>
                <h3 className={styles.bioName}>{TEAM[open].name}</h3>
                <p className={styles.bioRole}>{TEAM[open].role}</p>
              </header>
              {TEAM[open].bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className={styles.bioText}>
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </>
  );
}
