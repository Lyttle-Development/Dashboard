import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import { fetchApi } from "@/lib/fetchApi";
import { Task } from "@/lib/prisma";
import { SideToSide } from "@/components/SideToSide";

export function Page() {
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
      <SideToSide>
        <Button href="/task/create">
          <Icon icon={faListCheck}>Create Task</Icon>
        </Button>
      </SideToSide>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
