// GET all customers & POST a new customer
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const customers = await prisma.customer.findMany({
        include: { addresses: true, orders: true, invoices: true },
      });
      return res.status(200).json(customers);
    }
    case "POST": {
      const { name, email, phone } = req.body;
      const newCustomer = await prisma.customer.create({
        data: { name, email, phone },
      });
      return res.status(201).json(newCustomer);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
