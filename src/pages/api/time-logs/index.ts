import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const timeLogs = await prisma.timeLog.findMany({
        include: { project: true },
      });
      return res.status(200).json(timeLogs);
    }
    case "POST": {
      const {
        projectId,
        startTime,
        endTime,
        serviceType,
        category,
        hourlyRate,
        totalPrice,
      } = req.body;
      const newTimeLog = await prisma.timeLog.create({
        data: {
          projectId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          serviceType,
          category,
          hourlyRate,
          totalPrice,
        },
      });
      return res.status(201).json(newTimeLog);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
