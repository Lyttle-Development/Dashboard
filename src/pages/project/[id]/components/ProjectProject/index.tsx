import styles from "./index.module.scss";
import { Button } from "@/components/Button";
import { Project } from "@/lib/prisma";
import { LINKS } from "@/links";

interface ProjectProjectProps {
  project: Project;
  fetchProject: (projectId: string, noReload?: boolean) => void;
}

export function ProjectProject({ project, fetchProject }: ProjectProjectProps) {
  return (
    <>
      <h2>Child Projects</h2>
      <ul className={styles.child_projects}>
        {project.childProjects.map((childProject) => (
          <li key={childProject.id}>
            <Button
              href={LINKS.project.detail(childProject.id)}
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
