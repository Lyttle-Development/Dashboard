import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const printJob = await prisma.printJob.findUnique({
        where: { id: id as string },
        include: { material: true },
      });
      if (!printJob)
        return res.status(404).json({ error: "PrintJob not found" });
      return res.status(200).json(printJob);
    }
    case "PUT": {
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
      const updatedPrintJob = await prisma.printJob.update({
        where: { id: id as string },
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
      return res.status(200).json(updatedPrintJob);
    }
    case "DELETE": {
      const deletedPrintJob = await prisma.printJob.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedPrintJob);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
