import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const servicePrices = await prisma.servicePrice.findMany();
      return res.status(200).json(servicePrices);
    }
    case "POST": {
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
      const newServicePrice = await prisma.servicePrice.create({
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
      return res.status(201).json(newServicePrice);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
