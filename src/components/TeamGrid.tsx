import { TEAM } from "@/content/site";
import styles from "./TeamGrid.module.css";

/**
 * Portraits and nameplates are deliberately empty until the team supplies
 * real ones — an empty frame is honest, an invented name is not.
 */
export function TeamGrid() {
  return (
    <ul className={styles.grid}>
      {TEAM.map((member, index) => (
        <li key={`${member.role}-${index}`} className={styles.card}>
          <div className={styles.portrait}>
            {member.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photo} alt={member.name || member.role} className={styles.photo} />
            ) : (
              <svg viewBox="0 0 64 64" className={styles.silhouette} aria-hidden="true">
                <circle cx="32" cy="24" r="11" />
                <path d="M11 60c0-11.6 9.4-21 21-21s21 9.4 21 21" />
              </svg>
            )}
          </div>
          <p className={styles.name} data-empty={!member.name || undefined}>
            {member.name || " "}
          </p>
          <p className={styles.role}>{member.role}</p>
        </li>
      ))}
    </ul>
  );
}
