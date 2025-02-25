import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import {
  faCalendarPlus,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Select, SelectItemProps } from "@/components/Select";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Task } from "@/lib/prisma";

function mapTasksToOptions(prints: any[]): SelectItemProps[] {
  // Sort projects by creation date
  prints.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return prints.map((project) => {
    return {
      value: project.id,
      children: project.title,
    } as SelectItemProps;
  });
}

export function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const tasksData = await fetchApi<Task[]>({
      table: "task",
      where: {
        done: false,
      },
    });
    setTasks(tasksData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  if (loading) return <Loader />;
  if (!tasks?.length) return <div>No tasks found</div>;

  return (
    <Container>
      <h1>Tasks</h1>
      <Select
        icon={faMagnifyingGlass}
        label="Open Task"
        options={mapTasksToOptions(tasks)}
        onValueChange={(projectId) => router.push(`/task/${projectId}`)}
      />
      <Button href="/task/create">
        <Icon icon={faCalendarPlus}>Create Task</Icon>
      </Button>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
