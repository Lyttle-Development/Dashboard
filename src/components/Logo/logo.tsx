import { Link } from "@/components/link";
import styles from "./logo.module.scss";

export function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      Dashboard
    </Link>
  );
}
