import Image from "next/image";
import styles from "./Logo.module.css";

type LogoProps = {
  size?: number;
  spin?: boolean;
  showText?: boolean;
  className?: string;
};

export function Logo({ size = 40, spin = false, showText = true, className }: LogoProps) {
  return (
    <span className={`${styles.wrap} ${className ?? ""}`} data-spin={spin || undefined}>
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className={styles.icon}
        priority
      />
      {showText ? <span className={styles.text}>Crementum Teaching</span> : null}
    </span>
  );
}

export function LoadingLogo({ size = 48 }: { size?: number }) {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <Logo size={size} spin showText={false} />
    </div>
  );
}
