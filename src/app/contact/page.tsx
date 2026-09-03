import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { QuestionForm } from "@/components/QuestionForm";
import { getBranches } from "@/server/db";
import { FAQ, SITE } from "@/content/site";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a question to your local branch or to the head office.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const branches = await getBranches();

  return (
    <>
      <PageHeader
        variant="center"
        eyebrow="Contact"
        title="Ask us whatever you need to know."
        lede="Pick your branch, or send it to the head office."
      />

      <section className="band band--tight">
        <div className={`shell ${styles.grid}`}>
          <QuestionForm branches={branches} />

          <aside className={styles.side}>
            <p className="eyebrow">Direct</p>
            <ul className={styles.channels}>
              <li>
                <a href={`mailto:${SITE.email}`} className={styles.channel}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagram}
                  className={styles.channel}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {SITE.instagramHandle}
                </a>
              </li>
            </ul>

            <p className="eyebrow">Quick answers</p>
            <dl className={styles.faq}>
              {FAQ.map((item) => (
                <div key={item.q} className={styles.faqItem}>
                  <dt className={styles.faqQ}>{item.q}</dt>
                  <dd className={styles.faqA}>{item.a}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
