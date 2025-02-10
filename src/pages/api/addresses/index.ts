import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const addresses = await prisma.address.findMany({
        include: { customer: true },
      });
      return res.status(200).json(addresses);
    }
    case "POST": {
      const { street, city, state, country, zipCode, customerId } = req.body;
      const newAddress = await prisma.address.create({
        data: { street, city, state, country, zipCode, customerId },
      });
      return res.status(201).json(newAddress);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
