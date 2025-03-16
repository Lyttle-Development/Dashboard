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
import { LINKS } from "@/links";

export interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  const app = useApp();
  return (
    <aside className={styles.main_menu}>
      <Logo />
      <nav>
        <h5>Operations</h5>
        <ul>
          <MainNavItem href={LINKS.homepage}>
            <Icon icon={faHouseChimney} />
            Home
          </MainNavItem>
          <MainNavItem href={LINKS.project.root}>
            <Icon icon={faDiagramProject} />
            Projects
          </MainNavItem>
          {app.isAdmin && (
            <MainNavItem href={LINKS.print.root}>
              <Icon icon={faPrint} />
              Printing
            </MainNavItem>
          )}
          <MainNavItem href={LINKS.task.root}>
            <Icon icon={faListCheck} />
            Tasks
          </MainNavItem>
        </ul>
      </nav>
      <nav>
        <h5>Administration</h5>
        <ul>
          <MainNavItem href={LINKS.customer.root}>
            <Icon icon={faCircleUser} />
            Customers
          </MainNavItem>
          <MainNavItem href={LINKS.price.root}>
            <Icon icon={faTag} />
            Prices
          </MainNavItem>
          {app.isManager && (
            <>
              <MainNavItem href={LINKS.invoice.root}>
                <Icon icon={faFileInvoiceDollar} />
                Invoices
              </MainNavItem>
              <MainNavItem href={LINKS.expense.root}>
                <Icon icon={faHandHoldingDollar} />
                Expenses
              </MainNavItem>
            </>
          )}
        </ul>
      </nav>
      <ul className={styles.sub_menu}>
        <MainNavItem href={LINKS.fallback}>Fallback Dashboard</MainNavItem>
      </ul>
    </aside>
  );
}
