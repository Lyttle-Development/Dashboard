import { Project } from "@/lib/prisma";

export function getProjectFullName(
  project: Project,
  projects: Project[],
  str: string = "",
) {
  const parentProject = projects.find((p: Project) => p.id === project.id);

  str = parentProject.name + " > " + str;
  if (parentProject.parentProjectId) {
    return getProjectFullName(parentProject, projects, str);
  }

  return str;
}
