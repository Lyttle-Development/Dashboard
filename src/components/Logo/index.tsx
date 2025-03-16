import { Link } from "../Link";
import styles from "./index.module.scss";
import { LINKS } from "@/links";

export function Logo() {
  return (
    <Link href={LINKS.homepage} className={styles.logo}>
      Dashboard
    </Link>
  );
}
