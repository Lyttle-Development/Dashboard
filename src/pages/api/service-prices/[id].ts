import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const servicePrice = await prisma.servicePrice.findUnique({
        where: { id: id as string },
      });
      if (!servicePrice)
        return res.status(404).json({ error: "ServicePrice not found" });
      return res.status(200).json(servicePrice);
    }
    case "PUT": {
      const {
        category,
        service,
        estimatedMin,
        estimatedMax,
        standardMin,
        standardMax,
        friendsMin,
        friendsMax,
      } = req.body;
      const updatedServicePrice = await prisma.servicePrice.update({
        where: { id: id as string },
        data: {
          category,
          service,
          estimatedMin,
          estimatedMax,
          standardMin,
          standardMax,
          friendsMin,
          friendsMax,
        },
      });
      return res.status(200).json(updatedServicePrice);
    }
    case "DELETE": {
      const deletedServicePrice = await prisma.servicePrice.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedServicePrice);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
