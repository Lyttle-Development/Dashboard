import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const printMaterials = await prisma.printMaterial.findMany({
        include: { printJobs: true },
      });
      return res.status(200).json(printMaterials);
    }
    case "POST": {
      const { type, subType, stock, color, unitPrice } = req.body;
      const newPrintMaterial = await prisma.printMaterial.create({
        data: { type, subType, stock, color, unitPrice },
      });
      return res.status(201).json(newPrintMaterial);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
