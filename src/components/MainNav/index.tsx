import styles from "./index.module.scss";
import { MainNavItem } from "./components/MainNavItem";
import { Logo } from "@/components/Logo";

export interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  return (
    <aside className={`${styles["main-menu"]}`}>
      <Logo />
      <nav>
        <ul>
          <MainNavItem href={"/project"}>Project</MainNavItem>
          <MainNavItem href={"/print"}>Printing</MainNavItem>
          <MainNavItem href={"/customer"}>Customers</MainNavItem>
          <MainNavItem href={"/invoice"}>Invoices</MainNavItem>
          <MainNavItem href={"/price"}>Prices</MainNavItem>
          <MainNavItem href={"/task"}>Tasks</MainNavItem>
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={"/fallback"}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
