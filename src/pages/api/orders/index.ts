import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const orders = await prisma.order.findMany({
        include: { orderItems: true, customer: true },
      });
      return res.status(200).json(orders);
    }
    case "POST": {
      const { total, status, customerId } = req.body;
      const newOrder = await prisma.order.create({
        data: { total, status, customerId },
      });
      return res.status(201).json(newOrder);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
