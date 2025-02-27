import { SelectItemProps } from "@/components/Select";
import { Project } from "@/lib/prisma";
import { sortProjectsBasedOnTimeLogs } from "@/lib/project/sort-projects-based-on-time-logs";
import { getTimeLogProjects } from "@/lib/project/get-time-log-projects";
import { getProjectFullName } from "@/lib/project/get-project-full-name";

export function mapProjectsToOptions(
  projects: any[],
  onlyShowTimeLogProjects = false,
): SelectItemProps[] {
  projects = sortProjectsBasedOnTimeLogs(projects);
  projects = onlyShowTimeLogProjects ? getTimeLogProjects(projects) : projects;

  return projects.map((project: Project) => {
    return {
      value: project.id,
      children: project.parentProjectId
        ? getProjectFullName(project, projects)
        : project.name,
    } as SelectItemProps;
  });
}
