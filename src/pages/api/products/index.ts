import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const products = await prisma.product.findMany({
        include: { category: true, orderItems: true },
      });
      return res.status(200).json(products);
    }
    case "POST": {
      const { name, price, description, categoryId } = req.body;
      const newProduct = await prisma.product.create({
        data: { name, price, description, categoryId },
      });
      return res.status(201).json(newProduct);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
