// GET, PUT, DELETE a single customer by ID
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  switch (req.method) {
    case "GET": {
      const customer = await prisma.customer.findUnique({
        where: { id: id as string },
        include: { addresses: true, orders: true, invoices: true },
      });
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      return res.status(200).json(customer);
    }
    case "PUT": {
      const { name, email, phone } = req.body;
      const updatedCustomer = await prisma.customer.update({
        where: { id: id as string },
        data: { name, email, phone },
      });
      return res.status(200).json(updatedCustomer);
    }
    case "DELETE": {
      const deletedCustomer = await prisma.customer.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedCustomer);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
