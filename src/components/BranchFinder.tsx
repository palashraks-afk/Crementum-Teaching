"use client";

import { useMemo, useState } from "react";
import type { DbBranch } from "@/server/db";
import styles from "./BranchFinder.module.css";

/** Everything a visitor might reasonably type to find a branch. */
function haystack(branch: DbBranch) {
  return [branch.city, branch.region, branch.country, branch.school, branch.lead]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function BranchFinder({ branches }: { branches: DbBranch[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...branches].sort(
      (a, b) => Number(b.hq) - Number(a.hq) || a.city.localeCompare(b.city),
    );
    if (!q) return sorted;
    return sorted.filter((branch) => haystack(branch).includes(q));
  }, [branches, query]);

  return (
    <div className={styles.wrap}>
      <div className={styles.searchField}>
        <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className={styles.searchInput}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpenId(null);
          }}
          placeholder="Search by city, school or director"
          aria-label="Search branches"
        />
        {query ? (
          <button type="button" className={styles.clear} onClick={() => setQuery("")}>
            Clear
          </button>
        ) : null}
      </div>

      <p className={styles.count} aria-live="polite">
        {results.length === branches.length
          ? `${branches.length} branches`
          : `${results.length} of ${branches.length} branches`}
      </p>

      {results.length === 0 ? (
        <p className={styles.empty}>
          Nothing matches “{query.trim()}”. Sessions are online, so any branch can tutor you
          wherever you are.
        </p>
      ) : (
        <ul className={styles.list}>
          {results.map((branch) => {
            const open = openId === branch.id;
            return (
              <li key={branch.id} className={styles.item} data-open={open || undefined}>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : branch.id)}
                >
                  <span className={styles.rowMain}>
                    <span className={styles.city}>
                      {branch.city}
                      {branch.hq ? <span className={styles.hq}>Head office</span> : null}
                    </span>
                    <span className={styles.region}>
                      {[branch.region, branch.country].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open ? (
                  <div className={styles.detail}>
                    <dl className={styles.rows}>
                      <div>
                        <dt>City</dt>
                        <dd>{[branch.city, branch.region].filter(Boolean).join(", ")}</dd>
                      </div>
                      <div>
                        <dt>High school</dt>
                        <dd>{branch.school || "Not listed yet"}</dd>
                      </div>
                      <div>
                        <dt>Director</dt>
                        <dd>{branch.lead || "Not listed yet"}</dd>
                      </div>
                      {branch.founded ? (
                        <div>
                          <dt>Founded</dt>
                          <dd>{branch.founded}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {branch.about ? <p className={styles.about}>{branch.about}</p> : null}

                    {branch.contactEmail ? (
                      <a className={styles.email} href={`mailto:${branch.contactEmail}`}>
                        {branch.contactEmail}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
