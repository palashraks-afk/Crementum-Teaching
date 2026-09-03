"use client";

import { useEffect, useState } from "react";
import { getClientBookings } from "@/server/actions";
import { getClientId } from "./client-id";
import styles from "@/app/book/book.module.css";

type Booking = Awaited<ReturnType<typeof getClientBookings>>[number];

function Card({ booking }: { booking: Booking }) {
  // A requested date is not a confirmation, only staff moving the row to
  // 'scheduled' confirms it.
  const cancelled = booking.status === "cancelled";
  const confirmed = booking.status === "scheduled";
  const state = cancelled ? "cancelled" : confirmed ? "confirmed" : "pending";

  return (
    <article className={styles.card} data-state={state}>
      <header className={styles.cardTop}>
        <h3 className={styles.cardCourse}>{booking.course}</h3>
        <span className={styles.pill} data-state={state}>
          {state}
        </span>
      </header>

      <p className={styles.cardWhen}>
        {booking.scheduledAt
          ? `${confirmed ? "" : "Requested for "}${new Date(
              `${booking.scheduledAt}T00:00:00`,
            ).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}`
          : "Date to be arranged"}
      </p>

      {booking.details ? <p className={styles.cardNote}>{booking.details}</p> : null}

      <footer className={styles.cardFoot}>
        {booking.grade ? <span className={styles.tag}>{booking.grade}</span> : null}
        <span className={styles.cardHint}>
          {cancelled
            ? "Cancelled"
            : confirmed
              ? "Link arrives by email"
              : "Finding you a tutor"}
        </span>
      </footer>
    </article>
  );
}

export function MyBookings({ refreshKey }: { refreshKey: number }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    let live = true;
    const id = getClientId();
    if (!id) {
      setBookings([]);
      return;
    }
    getClientBookings(id).then((rows) => {
      if (live) setBookings(rows);
    });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (bookings === null) {
    return <p className={styles.loading}>Loading your sessions…</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className={styles.blank}>
        <h2 className={styles.blankTitle}>You have no sessions yet.</h2>
        <p className={styles.blankBody}>Book one below and it shows up here.</p>
      </div>
    );
  }

  const confirmed = bookings.filter((b) => b.status === "scheduled");
  const pending = bookings.filter(
    (b) => b.status !== "scheduled" && b.status !== "cancelled",
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const groups: [string, Booking[]][] = [
    ["Confirmed", confirmed],
    ["Pending", pending],
    ["Cancelled", cancelled],
  ];

  return (
    <>
      {groups.map(([label, rows]) =>
        rows.length ? (
          <div key={label} className={styles.group}>
            <h2 className={styles.groupTitle}>
              {label} <span className={styles.groupCount}>{rows.length}</span>
            </h2>
            <div className={styles.cards}>
              {rows.map((b) => (
                <Card key={b.id} booking={b} />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </>
  );
}
