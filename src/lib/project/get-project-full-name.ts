import { Project } from "@/lib/prisma";

export function getProjectFullName(
  project: Project,
  projects: Project[],
  str: string = "",
  originalProject: Project = null,
) {
  if (!originalProject) originalProject = project;
  const parentProject = projects.find(
    (p: Project) => p.id === project.parentProjectId,
  );

  if (!parentProject) {
    return str + originalProject.name;
  }

  str = parentProject.name + " > " + str;
  if (parentProject.parentProjectId) {
    return getProjectFullName(parentProject, projects, str, originalProject);
  }

  return str + originalProject.name;
}
