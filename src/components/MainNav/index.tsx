import styles from "./index.module.scss";
import { MainNavItem } from "./components/MainNavItem";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import {
  faCircleUser,
  faDiagramProject,
  faFileInvoiceDollar,
  faListCheck,
  faPrint,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

export interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  return (
    <aside className={`${styles["main-menu"]}`}>
      <Logo />
      <nav>
        <ul>
          <MainNavItem href={"/project"}>
            <Icon icon={faDiagramProject} />
            Projects
          </MainNavItem>
          <MainNavItem href={"/print"}>
            <Icon icon={faPrint} />
            Printing
          </MainNavItem>
          <MainNavItem href={"/customer"}>
            <Icon icon={faCircleUser} />
            Customers
          </MainNavItem>
          <MainNavItem href={"/invoice"}>
            <Icon icon={faFileInvoiceDollar} />
            Invoices
          </MainNavItem>
          <MainNavItem href={"/price"}>
            <Icon icon={faTag} />
            Prices
          </MainNavItem>
          <MainNavItem href={"/task"}>
            <Icon icon={faListCheck} />
            Tasks
          </MainNavItem>
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={"/fallback"}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
