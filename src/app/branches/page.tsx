import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { BranchFinder } from "@/components/BranchFinder";
import { getBranches } from "@/server/db";
import { SITE } from "@/content/site";
import styles from "./branches.module.css";

export const metadata: Metadata = {
  title: "Branches",
  description: "Find a Crementum Teaching branch by city, school or director.",
};

// Branches are admin-editable, so this page reads live on each request.
export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <>
      <PageHeader
        variant="rule"
        eyebrow="Branches"
        title="Run locally, open to anyone anywhere."
        lede="Sessions are online, so a student with no branch nearby gets matched just as fast."
      />

      <section className="band band--tight">
        <div className="shell">
          <BranchFinder branches={branches} />
        </div>
      </section>

      <section className="band band--dark">
        <div className={`shell ${styles.cta}`}>
          <div>
            <p className="eyebrow">No branch near you</p>
            <h2 className={styles.ctaTitle}>Start one where you live.</h2>
          </div>
          <Link href="/start-a-chapter" className="btn">
            Start a chapter
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
