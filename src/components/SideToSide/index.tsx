import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

export interface SideToSideProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SideToSide({ children, className, ...props }: SideToSideProps) {
  return (
    <section className={classNames(styles.side_to_side, className)} {...props}>
      {children}
    </section>
  );
}
