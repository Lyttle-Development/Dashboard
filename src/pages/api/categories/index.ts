import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const categories = await prisma.category.findMany({
        include: { products: true },
      });
      return res.status(200).json(categories);
    }
    case "POST": {
      const { name } = req.body;
      const newCategory = await prisma.category.create({
        data: { name },
      });
      return res.status(201).json(newCategory);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
