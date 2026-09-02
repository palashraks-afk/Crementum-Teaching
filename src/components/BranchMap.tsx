"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { DbBranch } from "@/server/db";
import styles from "./BranchMap.module.css";

// Leaflet touches window on import, so the map only loads in the browser.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className={styles.skeleton} />,
});

export function BranchMap({ branches }: { branches: DbBranch[] }) {
  const [view, setView] = useState<"usa" | "world">("usa");

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.views}>
          <button
            type="button"
            className={styles.viewBtn}
            data-active={view === "usa" || undefined}
            onClick={() => setView("usa")}
          >
            USA
          </button>
          <button
            type="button"
            className={styles.viewBtn}
            data-active={view === "world" || undefined}
            onClick={() => setView("world")}
          >
            World
          </button>
        </div>
        <p className={styles.count}>{branches.length} branches</p>
      </div>

      <LeafletMap branches={branches} view={view} />
    </div>
  );
}
