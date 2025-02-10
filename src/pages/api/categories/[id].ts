import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const category = await prisma.category.findUnique({
        where: { id: id as string },
        include: { products: true },
      });
      if (!category)
        return res.status(404).json({ error: "Category not found" });
      return res.status(200).json(category);
    }
    case "PUT": {
      const { name } = req.body;
      const updatedCategory = await prisma.category.update({
        where: { id: id as string },
        data: { name },
      });
      return res.status(200).json(updatedCategory);
    }
    case "DELETE": {
      const deletedCategory = await prisma.category.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedCategory);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
