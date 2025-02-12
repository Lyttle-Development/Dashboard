import styles from "./main-nav.module.scss";
import { MainNavItem } from "@/components/main-nav-item";
import { Logo } from "@/components/Logo";

export interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  return (
    <aside className={`${styles["main-menu"]}`}>
      <Logo />
      <nav>
        <ul>
          <MainNavItem href={"/dashboard/time"}>Time</MainNavItem>
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={"/dashboard"}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
