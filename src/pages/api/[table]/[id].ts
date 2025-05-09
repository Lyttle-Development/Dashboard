import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prisma';
import {isAdmin, requireAuth} from '@/lib/auth';
import {debugBuffer} from '@/lib/debug';

/**
 * Helper: convert hyphenated strings to camelCase.
 * Example: "print-job" becomes "printJob"
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts string values in the payload that match the "YYYY-MM-DDThh:mm" format into Date objects.
 */
function convertDates(payload: Record<string, any>): Record<string, any> {
  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ) {
      payload[key] = new Date(value);
    }
  });
  return payload;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await requireAuth(req, res);
  if (!session) return; // Stop execution if user is not authenticated

  await debugBuffer();

  const { table, id } = req.query;

  // Validate table parameter.
  if (!table) {
    return res.status(400).json({ error: "Table is required" });
  }
  if (typeof table !== "string") {
    return res.status(400).json({ error: "Table must be a string" });
  }
  // Validate id parameter.
  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID must be a string" });
  }

  // Convert the table parameter (e.g., "print-job") to camelCase (e.g., "printJob")
  const tableKey = toCamelCase(table);

  // Check if the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return res.status(404).json({ error: "Table not found" });
  }

  if (req.method === "GET") {
    try {
      const result = await prisma[tableKey].findMany({
        where: { ...JSON.parse((req.query.where as string) || "{}"), id },
        include: JSON.parse((req.query.relations as string) || "{}"),
        orderBy: JSON.parse((req.query.orderBy as string) || "[]"),
      });

      if (!result)
        return res.status(404).json({ error: `${tableKey} not found` });
      if (result.length > 0) return res.status(200).json(result[0]);
      return res.status(404).json({ error: `${tableKey} not found` });
    } catch (error) {
      console.log("Error fetching record:", error);
      return res.status(500).json({ error: "Error fetching record" });
    }
  } else if (req.method === "PUT") {
    // Ensure req.body is an object.
    const payload = req.body ? { ...req.body } : {};

    // Remove keys with empty string, null, or undefined values.
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        payload[key] = null;
      }
    });

    // Convert date fields in the payload.
    convertDates(payload);

    try {
      const result = await prisma[tableKey].update({
        where: { id },
        data: payload,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log("Error updating record:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    if (!isAdmin(session)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    try {
      const result = await prisma[tableKey].delete({
        where: { id },
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log("Error deleting record:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
