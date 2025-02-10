import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const order = await prisma.order.findUnique({
        where: { id: id as string },
        include: { orderItems: true, customer: true },
      });
      if (!order) return res.status(404).json({ error: "Order not found" });
      return res.status(200).json(order);
    }
    case "PUT": {
      const { total, status, customerId } = req.body;
      const updatedOrder = await prisma.order.update({
        where: { id: id as string },
        data: { total, status, customerId },
      });
      return res.status(200).json(updatedOrder);
    }
    case "DELETE": {
      const deletedOrder = await prisma.order.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedOrder);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
