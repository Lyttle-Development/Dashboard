import { SelectItemProps } from "@/components/Select";
import { Project } from "@/lib/prisma";
import { sortProjectsBasedOnTimeLogs } from "@/lib/project/sort-projects-based-on-time-logs";
import { getTimeLogProjects } from "@/lib/project/get-time-log-projects";
import { getProjectFullName } from "@/lib/project/get-project-full-name";

export function mapProjectsToOptions(
  projects: any[],
  onlyShowTimeLogProjects = false,
): SelectItemProps[] {
  let newProjects = sortProjectsBasedOnTimeLogs(projects);
  newProjects = onlyShowTimeLogProjects
    ? getTimeLogProjects(newProjects)
    : newProjects;

  return newProjects.map((project: Project) => {
    return {
      value: project.id,
      children: getProjectFullName(project, projects),
    } as SelectItemProps;
  });
}
