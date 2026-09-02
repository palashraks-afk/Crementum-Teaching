import { TEAM } from "@/content/site";
import styles from "./TeamGrid.module.css";

function Silhouette() {
  return (
    <svg viewBox="0 0 64 64" className={styles.silhouette} aria-hidden="true">
      <circle cx="32" cy="24" r="11" />
      <path d="M11 60c0-11.6 9.4-21 21-21s21 9.4 21 21" />
    </svg>
  );
}

/**
 * People with a bio get a full row, portrait beside their own words. Roles
 * still waiting on a name sit below as blank frames.
 */
export function TeamGrid() {
  const named = TEAM.filter((member) => member.name && member.bio.length > 0);
  const openRoles = TEAM.filter((member) => !member.name || member.bio.length === 0);

  return (
    <>
      <div className={styles.people}>
        {named.map((member) => (
          <article key={member.name} className={styles.person}>
            <figure className={styles.portrait}>
              {member.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo} alt={member.name} className={styles.photo} />
              ) : (
                <Silhouette />
              )}
            </figure>

            <div className={styles.text}>
              <h3 className={styles.name}>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              {member.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className={styles.bioText}>
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {openRoles.length > 0 ? (
        <div className={styles.openRoles}>
          <p className={styles.openLabel}>Also on the board</p>
          <ul className={styles.grid}>
            {openRoles.map((member, index) => (
              <li key={`${member.role}-${index}`} className={styles.slot}>
                <span className={styles.slotPortrait}>
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo} alt={member.name} className={styles.photo} />
                  ) : (
                    <Silhouette />
                  )}
                </span>
                <span className={styles.slotName} data-empty={!member.name || undefined}>
                  {member.name || " "}
                </span>
                <span className={styles.slotRole}>{member.role}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
