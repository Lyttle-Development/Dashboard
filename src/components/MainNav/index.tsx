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
          <MainNavItem href={"/dashboard/time"}>Time</MainNavItem>
          <MainNavItem href={"/dashboard/project"}>Project</MainNavItem>
          <MainNavItem href={"/dashboard/print"}>Printing</MainNavItem>
          <MainNavItem href={"/dashboard/customer"}>Customers</MainNavItem>
          {/*<MainNavItem href={"/dashboard/invoice"}>Invoices</MainNavItem>*/}
          <MainNavItem href={"/dashboard/price"}>Prices</MainNavItem>
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={"/dashboard"}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
