import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const product = await prisma.product.findUnique({
        where: { id: id as string },
        include: { category: true, orderItems: true },
      });
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json(product);
    }
    case "PUT": {
      const { name, price, description, categoryId } = req.body;
      const updatedProduct = await prisma.product.update({
        where: { id: id as string },
        data: { name, price, description, categoryId },
      });
      return res.status(200).json(updatedProduct);
    }
    case "DELETE": {
      const deletedProduct = await prisma.product.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedProduct);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
