import { Link } from "../Link";
import styles from "./index.module.scss";

export function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      Dashboard
    </Link>
  );
}
