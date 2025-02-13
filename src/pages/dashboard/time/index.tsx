import { Layout } from "@/layouts";

import styles from "./index.module.scss";
import { useState } from "react";
import { Link } from "@/components/link";

export function Page() {
  const [topic, setTopic] = useState<string | null>(null);

  return (
    <div className={styles.main}>
      <h2>Select a time type.</h2>
      <Link href="/dashboard/time/print-job">Print Jobs</Link>
      <Link href="/dashboard/time/project">Projects</Link>
    </div>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
