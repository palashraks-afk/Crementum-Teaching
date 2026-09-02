import styles from "./PageHeader.module.css";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * Structural variant, so pages don't all open with the same block.
   * default — left aligned on white
   * split   — oversized figure on the left, title on the right
   * center  — centred on a tinted band
   * rule    — title sits under a heavy rule with the eyebrow inline
   */
  variant?: "default" | "split" | "center" | "rule";
  /** Big figure shown by the `split` variant. */
  figure?: string;
};

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
  variant = "default",
  figure,
}: Props) {
  return (
    <header
      className={`band band--tight ${styles.header} ${variant === "center" ? "band--cream" : ""}`}
      data-variant={variant}
    >
      <div className={`shell ${styles.inner}`}>
        {variant === "split" && figure ? (
          <p className={styles.figure} aria-hidden="true">
            {figure}
          </p>
        ) : null}

        <div className={styles.body}>
          <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {lede ? <p className={`lede ${styles.lede}`}>{lede}</p> : null}
          {children ? <div className={styles.extra}>{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
