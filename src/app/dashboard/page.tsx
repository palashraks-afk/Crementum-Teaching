import type { Metadata } from "next";
import { Suspense } from "react";
import { auth, googleEnabled } from "@/auth";
import { SessionRequestForm } from "@/components/SessionRequestForm";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { HowItWorksPopup } from "@/components/HowItWorksPopup";
import { Logo } from "@/components/Logo";
import { getUserBookings } from "@/server/actions";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Book a free session and track the ones you have already requested.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Pick your class", body: "Choose from the list, or type it yourself." },
  { title: "Say what you're stuck on", body: "One or two sentences is enough." },
  { title: "Watch your email", body: "A tutor reaches out, usually within hours." },
];

type Booking = Awaited<ReturnType<typeof getUserBookings>>[number];

function ClassCard({ booking }: { booking: Booking }) {
  const confirmed = booking.status === "scheduled" || Boolean(booking.scheduledAt);

  return (
    <article className={styles.card} data-confirmed={confirmed || undefined}>
      <header className={styles.cardTop}>
        <h3 className={styles.cardCourse}>{booking.course}</h3>
        <span className={styles.pill} data-confirmed={confirmed || undefined}>
          {confirmed ? "Confirmed" : "Pending"}
        </span>
      </header>

      <p className={styles.cardWhen}>
        {booking.scheduledAt
          ? new Date(booking.scheduledAt).toLocaleString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : booking.when || "Time to be arranged"}
      </p>

      {booking.details ? <p className={styles.cardNote}>{booking.details}</p> : null}

      <footer className={styles.cardFoot}>
        {booking.grade ? <span className={styles.tag}>{booking.grade}</span> : null}
        <span className={styles.cardHint}>
          {confirmed ? "Link arrives by email" : "Finding you a tutor"}
        </span>
      </footer>
    </article>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const name = session?.user?.name ?? null;
  const bookings = email ? await getUserBookings(email) : [];
  const firstTime = bookings.length === 0;

  const confirmed = bookings.filter((b) => b.status === "scheduled" || b.scheduledAt);
  const pending = bookings.filter((b) => !(b.status === "scheduled" || b.scheduledAt));

  return (
    <>
      <div className={styles.bar}>
        <div className={`shell ${styles.barInner}`}>
          <span className={styles.barBrand}>
            <Logo size={22} showText={false} />
            Dashboard
          </span>
          <span className={styles.barStats}>
            {bookings.length > 0 ? (
              <>
                <span className={styles.stat}>
                  <b>{confirmed.length}</b> confirmed
                </span>
                <span className={styles.stat}>
                  <b>{pending.length}</b> pending
                </span>
              </>
            ) : null}
            {email ? (
              <span className={styles.account}>
                <span className={styles.accountEmail}>{email}</span>
                <SignOutButton />
              </span>
            ) : googleEnabled ? (
              <SignInButton label="Sign in" />
            ) : null}
          </span>
        </div>
      </div>

      {firstTime ? (
        <section className="band band--tight band--cream">
          <div className="shell">
            <p className="eyebrow">How it works</p>
            <ol className={styles.steps}>
              {STEPS.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNum}>{index + 1}</span>
                  <h2 className={styles.stepTitle}>{step.title}</h2>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : (
        <HowItWorksPopup steps={STEPS} />
      )}

      <section className="band band--tight">
        <div className={`shell ${styles.layout}`}>
          {/* Classes first on wide screens; the form drops below on mobile. */}
          <div className={styles.classes}>
            {bookings.length === 0 ? (
              <div className={styles.blank}>
                <h2 className={styles.blankTitle}>No classes yet.</h2>
                <p className={styles.blankBody}>
                  {email
                    ? "Book one on the right and it shows up here."
                    : "Book one on the right. Sign in to keep track of them here."}
                </p>
              </div>
            ) : (
              <>
                {confirmed.length > 0 ? (
                  <div className={styles.group}>
                    <h2 className={styles.groupTitle}>
                      Confirmed <span className={styles.groupCount}>{confirmed.length}</span>
                    </h2>
                    <div className={styles.cards}>
                      {confirmed.map((b) => (
                        <ClassCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {pending.length > 0 ? (
                  <div className={styles.group}>
                    <h2 className={styles.groupTitle}>
                      Pending <span className={styles.groupCount}>{pending.length}</span>
                    </h2>
                    <div className={styles.cards}>
                      {pending.map((b) => (
                        <ClassCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <aside className={styles.booker}>
            <h2 className={styles.bookerTitle}>
              {firstTime ? "Book your first session" : "Book another"}
            </h2>
            <div className={styles.form}>
              <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
                <SessionRequestForm defaultName={name} defaultEmail={email} />
              </Suspense>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
