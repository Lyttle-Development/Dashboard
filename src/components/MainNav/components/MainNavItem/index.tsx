import styles from "./index.module.scss";
import { Link } from "../../../Link";

export interface MainNavItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  route?: string;
  locked?: boolean;
  note?: string;
}

export function MainNavItem({
  href,
  onClick,
  children,
  route,
  locked = false,
  note,
}: MainNavItemProps) {
  route = route ?? href;
  return (
    <Link
      href={href}
      route={route}
      onClick={onClick}
      className={styles["main-menu-item"]}
      classNameActive={styles["main-menu-item--active"]}
    >
      {children}
      <span className={styles.note}>{note}</span>
    </Link>
  );
}
