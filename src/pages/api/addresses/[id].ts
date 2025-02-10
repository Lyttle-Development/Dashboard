import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  switch (req.method) {
    case "GET": {
      const address = await prisma.address.findUnique({
        where: { id: id as string },
        include: { customer: true },
      });
      if (!address) return res.status(404).json({ error: "Address not found" });
      return res.status(200).json(address);
    }
    case "PUT": {
      const { street, city, state, country, zipCode, customerId } = req.body;
      const updatedAddress = await prisma.address.update({
        where: { id: id as string },
        data: { street, city, state, country, zipCode, customerId },
      });
      return res.status(200).json(updatedAddress);
    }
    case "DELETE": {
      const deletedAddress = await prisma.address.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedAddress);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
