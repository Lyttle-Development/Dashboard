import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  switch (req.method) {
    case "GET": {
      const invoice = await prisma.invoice.findUnique({
        where: { id: id as string },
        include: { customer: true },
      });
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      return res.status(200).json(invoice);
    }
    case "PUT": {
      const { amount, status, customerId } = req.body;
      const updatedInvoice = await prisma.invoice.update({
        where: { id: id as string },
        data: { amount, status, customerId },
      });
      return res.status(200).json(updatedInvoice);
    }
    case "DELETE": {
      const deletedInvoice = await prisma.invoice.delete({
        where: { id: id as string },
      });
      return res.status(200).json(deletedInvoice);
    }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
