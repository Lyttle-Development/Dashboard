import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const orderItems = await prisma.orderItem.findMany({
        include: { product: true, order: true },
      });
      return res.status(200).json(orderItems);
    }
    case "POST": {
      const { quantity, price, productId, orderId } = req.body;
      const newOrderItem = await prisma.orderItem.create({
        data: { quantity, price, productId, orderId },
      });
      return res.status(201).json(newOrderItem);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
