import classNames from "classnames";
import styles from "./index.module.scss";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <section className={classNames(styles.container, className)} {...rest}>
      {children}
    </section>
  );
}
