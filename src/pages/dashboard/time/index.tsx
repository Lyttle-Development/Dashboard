import { Layout } from "@/layouts";

import styles from "./index.module.scss";
import { useState } from "react";
import { ProjectsSelect } from "@/pages/dashboard/time/components/projects-select";
import { PrintJobsSelect } from "@/pages/dashboard/time/components/print-jobs-select";
import { TopicSelect } from "@/pages/dashboard/time/components/topic-select";

export function Page() {
  const [topic, setTopic] = useState<string | null>(null);

  return (
    <div className={styles.main}>
      {!topic && <TopicSelect setTopic={setTopic} />}
      {topic === "project" && <ProjectsSelect />}
      {topic === "print-job" && <PrintJobsSelect />}
    </div>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
