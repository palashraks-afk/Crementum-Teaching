import type { Metadata } from "next";
import Link from "next/link";
import { auth, googleEnabled } from "@/auth";
import { PageHeader } from "@/components/PageHeader";
import { AccountAuth } from "@/components/AccountAuth";
import { BranchPicker } from "@/components/BranchPicker";
import { SignOutButton } from "@/components/AuthButtons";
import { getBranches, getUserByEmail } from "@/server/db";
import { getUserBookings } from "@/server/actions";
import styles from "./account.module.css";

export const metadata: Metadata = {
  title: "Account",
  description: "Your branch, your sessions, your sign-in.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email) {
    return (
      <>
        <PageHeader eyebrow="Account" title="Sign in." lede="Or make one. Takes a second." />
        <section className="band band--tight">
          <div className="shell">
            <AccountAuth googleEnabled={googleEnabled} />
          </div>
        </section>
      </>
    );
  }

  const [user, branches, bookings] = await Promise.all([
    getUserByEmail(email),
    getBranches(),
    getUserBookings(email),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={session?.user?.name ? `${session.user.name.split(" ")[0]}.` : "Your account."}
      >
        <div className={styles.meta}>
          <span className={styles.email}>{email}</span>
          <SignOutButton />
        </div>
      </PageHeader>

      <section className="band band--tight">
        <div className="shell">
          <BranchPicker branches={branches} current={user?.branchId ?? null} />
        </div>
      </section>

      <section className="band band--tight band--cream">
        <div className="shell">
          <div className={styles.head}>
            <p className="eyebrow">Sessions</p>
            <Link href="/dashboard" className="btn">
              Book
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className={styles.empty}>None yet.</p>
          ) : (
            <ul className={styles.list}>
              {bookings.map((b) => (
                <li key={b.id} className={styles.item}>
                  <span className={styles.course}>{b.course}</span>
                  <span className={styles.status}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
