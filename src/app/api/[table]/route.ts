import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { requireAuthApp } from '@/lib/auth';
import { debugBuffer } from '@/lib/debug';
import { reopenRecurringExpenses } from '@/lib/prisma/expense';

/**
 * Helper: convert hyphenated strings to camelCase.
 * Example: "print-job" becomes "printJob"
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const session = await requireAuthApp(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await debugBuffer();

  const { table } = await params;
  const { searchParams } = new URL(request.url);

  // Validate that "table" is provided and is a string.
  if (!table) {
    return NextResponse.json({ error: "Table is required" }, { status: 400 });
  }
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Table must be a string" }, { status: 400 });
  }

  // Convert table parameter (e.g. "print-job") to camelCase (e.g. "printJob")
  const tableKey = toCamelCase(table);

  // Check that the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    if (tableKey === "expense") {
      await reopenRecurringExpenses();
    }

    const whereParam = searchParams.get('where');
    const relationsParam = searchParams.get('relations');
    const orderByParam = searchParams.get('orderBy');

    const result = await prisma[tableKey].findMany({
      where: JSON.parse(whereParam || "{}"),
      include: JSON.parse(relationsParam || "{}"),
      orderBy: JSON.parse(orderByParam || "[]"),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Error fetching data:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const session = await requireAuthApp(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await debugBuffer();

  const { table } = await params;

  // Validate that "table" is provided and is a string.
  if (!table) {
    return NextResponse.json({ error: "Table is required" }, { status: 400 });
  }
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Table must be a string" }, { status: 400 });
  }

  // Convert table parameter (e.g. "print-job") to camelCase (e.g. "printJob")
  const tableKey = toCamelCase(table);

  // Check that the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    // Ensure body is an object.
    const payload = body ? { ...body } : {};

    // Remove fields that are empty, null, or undefined.
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === null ||
        payload[key] === undefined ||
        payload[key] === ""
      ) {
        payload[key] = null;
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

    const result = await prisma[tableKey].create({ data: payload });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.log("Error creating record:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}