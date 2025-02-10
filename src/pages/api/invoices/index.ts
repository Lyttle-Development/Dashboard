import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET": {
      const invoices = await prisma.invoice.findMany({
        include: { customer: true },
      });
      return res.status(200).json(invoices);
    }
    case "POST": {
      const { amount, status, customerId } = req.body;
      const newInvoice = await prisma.invoice.create({
        data: { amount, status, customerId },
      });
      return res.status(201).json(newInvoice);
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
