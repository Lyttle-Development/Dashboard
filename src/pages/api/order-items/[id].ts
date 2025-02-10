import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const orderItem = await prisma.orderItem.findUnique({
        where: { id: id as string },
        include: { product: true, order: true },
      });
      if (!orderItem)
        return res.status(404).json({ error: "OrderItem not found" });
      return res.status(200).json(orderItem);
    }
    case "PUT": {
      const { quantity, price, productId, orderId } = req.body;
      const updatedOrderItem = await prisma.orderItem.update({
        where: { id: id as string },
        data: { quantity, price, productId, orderId },
      });
      return res.status(200).json(updatedOrderItem);
    }
    case "DELETE": {
      const deletedOrderItem = await prisma.orderItem.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedOrderItem);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
