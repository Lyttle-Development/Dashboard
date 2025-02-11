import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prisma';

/**
 * Helper: convert hyphenated strings to camelCase.
 * Example: "print-job" becomes "printJob"
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { table } = req.query;

  // Validate that "table" is provided and is a string.
  if (!table) {
    return res.status(400).json({ error: "Table is required" });
  }
  if (typeof table !== "string") {
    return res.status(400).json({ error: "Table must be a string" });
  }

  // Convert table parameter (e.g. "print-job") to camelCase (e.g. "printJob")
  const tableKey = toCamelCase(table);

  // Check that the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return res.status(404).json({ error: "Table not found" });
  }

  if (req.method === "GET") {
    try {
      const result = await prisma[tableKey].findMany();

      return res.status(200).json(result);
    } catch (error) {
      console.log("Error fetching data:", error);
      return res.status(500).json({ error: "Error fetching data" });
    }
  } else if (req.method === "POST") {
    // Ensure req.body is an object.
    const payload = req.body ? { ...req.body } : {};

    // Remove fields that are empty, null, or undefined.
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === null ||
        payload[key] === undefined ||
        payload[key] === ""
      ) {
        delete payload[key];
      }
    });

    // Fix date fields: if a field is a string in the format "YYYY-MM-DDThh:mm", convert it to a Date object.
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === "string") {
        const dateStr = payload[key];
        // Check if the string matches the pattern "YYYY-MM-DDThh:mm"
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
          payload[key] = new Date(dateStr);
        }
      }
    });

    console.log("Received payload:", payload);

    try {
      const result = await prisma[tableKey].create({ data: payload });
      return res.status(201).json(result);
    } catch (error) {
      console.log("Error creating record:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
