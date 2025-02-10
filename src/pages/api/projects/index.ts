import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const projects = await prisma.project.findMany({
        include: { timeLogs: true },
      });
      return res.status(200).json(projects);
    }
    case "POST": {
      const { name, client } = req.body;
      const newProject = await prisma.project.create({
        data: { name, client },
      });
      return res.status(201).json(newProject);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
