import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const timeLog = await prisma.timeLog.findUnique({
        where: { id: id as string },
        include: { project: true },
      });
      if (!timeLog) return res.status(404).json({ error: "TimeLog not found" });
      return res.status(200).json(timeLog);
    }
    case "PUT": {
      const {
        projectId,
        startTime,
        endTime,
        serviceType,
        category,
        hourlyRate,
        totalPrice,
      } = req.body;
      const updatedTimeLog = await prisma.timeLog.update({
        where: { id: id as string },
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
      return res.status(200).json(updatedTimeLog);
    }
    case "DELETE": {
      const deletedTimeLog = await prisma.timeLog.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedTimeLog);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
