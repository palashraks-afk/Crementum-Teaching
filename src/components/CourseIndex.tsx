"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { COURSES, CORE_BY_ID, type Course } from "@/content/catalog";
import styles from "./CourseIndex.module.css";

/** Shown when the field is empty, so the box is useful before anyone types. */
const QUICK_PICKS = [
  "ap-calculus-bc",
  "us-history",
  "ap-chemistry",
  "ap-english-language",
  "public-forum",
];

const MAX_ROWS = 6;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matches(course: Course, query: string) {
  if (!query) return false;
  const haystack = [course.name, ...(course.aka ?? []), CORE_BY_ID[course.core].name];
  return haystack.some((value) => normalize(value).includes(query));
}

/**
 * Renders the course name with the typed text marked. Matching runs on the
 * normalized string but the mark is applied to the original characters, so
 * punctuation and capitals survive intact.
 */
function Highlighted({ name, query }: { name: string; query: string }) {
  if (!query) return <>{name}</>;

  const map: number[] = [];
  let normalized = "";
  let lastWasSpace = true;
  for (let i = 0; i < name.length; i++) {
    const char = name[i].toLowerCase();
    if (/[a-z0-9]/.test(char)) {
      normalized += char;
      map.push(i);
      lastWasSpace = false;
    } else if (!lastWasSpace) {
      normalized += " ";
      map.push(i);
      lastWasSpace = true;
    }
  }

  const start = normalized.indexOf(query);
  if (start === -1) return <>{name}</>;

  const from = map[start];
  const to = map[Math.min(start + query.length - 1, map.length - 1)] + 1;

  return (
    <>
      {name.slice(0, from)}
      <mark className={styles.hit}>{name.slice(from, to)}</mark>
      {name.slice(to)}
    </>
  );
}

export function CourseIndex({ label }: { label: string }) {
  const [raw, setRaw] = useState("");
  const inputId = useId();
  const query = normalize(raw);

  const results = useMemo(
    () => (query ? COURSES.filter((course) => matches(course, query)) : []),
    [query],
  );

  const shown = results.slice(0, MAX_ROWS);
  const overflow = results.length - shown.length;
  const picks = QUICK_PICKS.map((slug) => COURSES.find((c) => c.slug === slug)).filter(
    (c): c is Course => Boolean(c),
  );

  return (
    <div className={styles.wrap}>
      <label htmlFor={inputId} className="visually-hidden">
        {label}
      </label>
      <div className={styles.field}>
        <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id={inputId}
          type="search"
          className={styles.input}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Search 36 classes — calculus, apush, chem…"
          autoComplete="off"
          spellCheck={false}
        />
        {raw ? (
          <button type="button" className={styles.clear} onClick={() => setRaw("")}>
            Clear
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!query ? (
          <motion.div
            key="picks"
            className={styles.picks}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {picks.map((course) => (
              <button
                key={course.slug}
                type="button"
                className={styles.pick}
                onClick={() => setRaw(course.name)}
              >
                {course.name}
              </button>
            ))}
          </motion.div>
        ) : results.length > 0 ? (
          <motion.ul
            key="results"
            className={styles.list}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {shown.map((course) => (
              <li key={course.slug}>
                <Link href={`/book?course=${course.slug}`} className={styles.row}>
                  <span className={styles.name}>
                    <Highlighted name={course.name} query={query} />
                  </span>
                  <span className={styles.core}>{CORE_BY_ID[course.core].name}</span>
                  <span className={styles.go} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
            {overflow > 0 ? <li className={styles.more}>+{overflow} more — keep typing</li> : null}
          </motion.ul>
        ) : (
          <motion.p
            key="empty"
            className={styles.empty}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            No match.{" "}
            <Link href="/book" className="link">
              Ask for it anyway
            </Link>
            .
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
