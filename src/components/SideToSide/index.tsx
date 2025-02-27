import React from "react";
import styles from "./index.module.scss";

export interface SideToSideProps {
  children: React.ReactNode;
}

export function SideToSide({ children }: SideToSideProps) {
  return <section className={styles.side_to_side}>{children}</section>;
}
