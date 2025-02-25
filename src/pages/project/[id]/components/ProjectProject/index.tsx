import styles from "../../index.module.scss";
import { Button } from "@/components/Button";
import { Project } from "@/lib/prisma";

interface ProjectProjectProps {
  project: Project;
  fetchProject: (projectId: string) => void;
}

export function ProjectProject({ project, fetchProject }: ProjectProjectProps) {
  return (
    <>
      <h2>Child Projects</h2>
      <ul className={styles.child_projects}>
        {project.childProjects.map((childProject) => (
          <li key={childProject.id}>
            <Button
              href={`/project/${childProject.id}`}
              onClick={() => fetchProject(childProject.id)}
            >
              {childProject.name}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ProjectProject;
