import styles from "./index.module.scss";
import { MainNavItem } from "./components/MainNavItem";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import {
  faCircleUser,
  faDiagramProject,
  faFileInvoiceDollar,
  faHandHoldingDollar,
  faHouseChimney,
  faListCheck,
  faPrint,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "@/contexts/App.context";

export interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  const app = useApp();
  return (
    <aside className={styles.main_menu}>
      <Logo />
      <nav>
        <h5>Operations</h5>
        <ul>
          <MainNavItem href={"/"}>
            <Icon icon={faHouseChimney} />
            Home
          </MainNavItem>
          <MainNavItem href={"/project"}>
            <Icon icon={faDiagramProject} />
            Projects
          </MainNavItem>
          {app.isAdmin && (
            <MainNavItem href={"/print"}>
              <Icon icon={faPrint} />
              Printing
            </MainNavItem>
          )}
          <MainNavItem href={"/task"}>
            <Icon icon={faListCheck} />
            Tasks
          </MainNavItem>
        </ul>
      </nav>
      <nav>
        <h5>Administration</h5>
        <ul>
          <MainNavItem href={"/customer"}>
            <Icon icon={faCircleUser} />
            Customers
          </MainNavItem>
          <MainNavItem href={"/price"}>
            <Icon icon={faTag} />
            Prices
          </MainNavItem>
          {app.isManager && (
            <>
              <MainNavItem href={"/invoice"}>
                <Icon icon={faFileInvoiceDollar} />
                Invoices
              </MainNavItem>
              <MainNavItem href={"/expense"}>
                <Icon icon={faHandHoldingDollar} />
                Expenses
              </MainNavItem>
            </>
          )}
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={"/fallback"}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
