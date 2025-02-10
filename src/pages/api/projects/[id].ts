import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const project = await prisma.project.findUnique({
        where: { id: id as string },
        include: { timeLogs: true },
      });
      if (!project) return res.status(404).json({ error: "Project not found" });
      return res.status(200).json(project);
    }
    case "PUT": {
      const { name, client } = req.body;
      const updatedProject = await prisma.project.update({
        where: { id: id as string },
        data: { name, client },
      });
      return res.status(200).json(updatedProject);
    }
    case "DELETE": {
      const deletedProject = await prisma.project.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedProject);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
