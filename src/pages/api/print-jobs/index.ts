import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const printJobs = await prisma.printJob.findMany({
        include: { material: true },
      });
      return res.status(200).json(printJobs);
    }
    case "POST": {
      const {
        scheduledDate,
        quantity,
        product,
        printType,
        materialId,
        color,
        printTime,
        weight,
        totalPrice,
        suggestedPrice,
      } = req.body;
      const newPrintJob = await prisma.printJob.create({
        data: {
          scheduledDate: new Date(scheduledDate),
          quantity,
          product,
          printType,
          materialId,
          color,
          printTime,
          weight,
          totalPrice,
          suggestedPrice,
        },
      });
      return res.status(201).json(newPrintJob);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
