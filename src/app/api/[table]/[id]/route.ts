import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { isAdmin, requireAuthApp } from '@/lib/auth';
import { debugBuffer } from '@/lib/debug';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  const session = await requireAuthApp(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await debugBuffer();

  const { table, id } = params;
  const { searchParams } = new URL(request.url);

  // Validate table parameter.
  if (!table) {
    return NextResponse.json({ error: "Table is required" }, { status: 400 });
  }
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Table must be a string" }, { status: 400 });
  }
  // Validate id parameter.
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  if (typeof id !== "string") {
    return NextResponse.json({ error: "ID must be a string" }, { status: 400 });
  }

  // Convert the table parameter (e.g., "print-job") to camelCase (e.g., "printJob")
  const tableKey = toCamelCase(table);

  // Check if the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const whereParam = searchParams.get('where');
    const relationsParam = searchParams.get('relations');
    const orderByParam = searchParams.get('orderBy');

    const result = await prisma[tableKey].findMany({
      where: { ...JSON.parse(whereParam || "{}"), id },
      include: JSON.parse(relationsParam || "{}"),
      orderBy: JSON.parse(orderByParam || "[]"),
    });

    if (!result) {
      return NextResponse.json({ error: `${tableKey} not found` }, { status: 404 });
    }
    if (result.length > 0) {
      return NextResponse.json(result[0], { status: 200 });
    }
    return NextResponse.json({ error: `${tableKey} not found` }, { status: 404 });
  } catch (error) {
    console.log("Error fetching record:", error);
    return NextResponse.json({ error: "Error fetching record" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  const session = await requireAuthApp(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await debugBuffer();

  const { table, id } = params;

  // Validate table parameter.
  if (!table) {
    return NextResponse.json({ error: "Table is required" }, { status: 400 });
  }
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Table must be a string" }, { status: 400 });
  }
  // Validate id parameter.
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  if (typeof id !== "string") {
    return NextResponse.json({ error: "ID must be a string" }, { status: 400 });
  }

  // Convert the table parameter (e.g., "print-job") to camelCase (e.g., "printJob")
  const tableKey = toCamelCase(table);

  // Check if the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    // Ensure body is an object.
    const payload = body ? { ...body } : {};

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

    const result = await prisma[tableKey].update({
      where: { id },
      data: payload,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.log("Error updating record:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  const session = await requireAuthApp(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await debugBuffer();

  const { table, id } = params;

  // Validate table parameter.
  if (!table) {
    return NextResponse.json({ error: "Table is required" }, { status: 400 });
  }
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Table must be a string" }, { status: 400 });
  }
  // Validate id parameter.
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  if (typeof id !== "string") {
    return NextResponse.json({ error: "ID must be a string" }, { status: 400 });
  }

  // Convert the table parameter (e.g., "print-job") to camelCase (e.g., "printJob")
  const tableKey = toCamelCase(table);

  // Check if the Prisma client has a model for this table.
  if (prisma[tableKey] === undefined) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const result = await prisma[tableKey].delete({
      where: { id },
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.log("Error deleting record:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}