"use client";

import { Suspense, useCallback, useState } from "react";
import { MyBookings } from "./MyBookings";
import { SessionRequestForm } from "./SessionRequestForm";
import styles from "@/app/book/book.module.css";

export function BookWorkspace() {
  // Bumped when a booking lands, so the list above refetches without a reload.
  const [refreshKey, setRefreshKey] = useState(0);
  const handleBooked = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className={styles.layout}>
      <div className={styles.classes}>
        <MyBookings refreshKey={refreshKey} />
      </div>

      <aside className={styles.booker}>
        <h2 className={styles.bookerTitle}>Book a session</h2>
        <div className={styles.form}>
          <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
            <SessionRequestForm onBooked={handleBooked} />
          </Suspense>
        </div>
      </aside>
    </div>
  );
}
