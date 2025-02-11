import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const printMaterial = await prisma.printMaterial.findUnique({
        where: { id: id as string },
        include: { printJobs: true },
      });
      if (!printMaterial)
        return res.status(404).json({ error: "PrintMaterial not found" });
      return res.status(200).json(printMaterial);
    }
    case "PUT": {
      const { type, subType, stock, color, unitPrice } = req.body;
      const updatedPrintMaterial = await prisma.printMaterial.update({
        where: { id: id as string },
        data: { type, subType, stock, color, unitPrice },
      });
      return res.status(200).json(updatedPrintMaterial);
    }
    case "DELETE": {
      const deletedPrintMaterial = await prisma.printMaterial.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedPrintMaterial);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
