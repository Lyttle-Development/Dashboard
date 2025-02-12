import { Layout } from "..";
import styles from "./default.module.scss";
import { MainNav } from "@/components/main-nav";

export interface DefaultProps {
  children: React.ReactNode;
}

export function Default({ children }: DefaultProps) {
  return (
    <Layout.Base>
      <div className={`default-layout ${styles["default-layout"]}`}>
        <MainNav />
        <section className={"default-layout__content"}>
          <main className={`${styles.main}`}>{children}</main>
        </section>
      </div>
    </Layout.Base>
  );
}

export function getDefault(page: React.ReactNode) {
  return <Default>{page}</Default>;
}
