import { Project } from "@/lib/prisma";

export function getTimeLogProjects(projects: Project[]) {
  return projects.filter(
    // Filter out Project-Project Project Prices
    (p) => p.priceId != "133f319d-101f-4b0a-91ae-c3ebb0483714",
  );
}
