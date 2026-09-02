import type { Metadata } from "next";
import { BranchAdmin } from "@/components/BranchAdmin";
import { AdminLogin } from "@/components/AdminLogin";
import { adminLogout } from "@/server/actions";
import { isAdmin, adminEnabled } from "@/server/admin";
import { getBranches } from "@/server/db";
import { Logo } from "@/components/Logo";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminEnabled()) {
    return (
      <section className="band">
        <div className="shell">
          <h1 className={styles.title}>Admin is off.</h1>
          <p className={styles.note}>
            Set <code>ADMIN_PASSWORD</code> in <code>.env</code> and restart to turn it on.
          </p>
        </div>
      </section>
    );
  }

  if (!(await isAdmin())) {
    return (
      <section className="band">
        <div className="shell">
          <h1 className={styles.title}>Admin</h1>
          <AdminLogin />
        </div>
      </section>
    );
  }

  const branches = await getBranches();

  return (
    <>
      <div className={styles.bar}>
        <div className={`shell ${styles.barInner}`}>
          <span className={styles.brand}>
            <Logo size={22} showText={false} />
            Admin
          </span>
          <form action={adminLogout}>
            <button type="submit" className={styles.signOut}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="band band--tight">
        <div className="shell">
          <BranchAdmin branches={branches} />
        </div>
      </section>
    </>
  );
}
