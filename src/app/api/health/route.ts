import { NextRequest, NextResponse } from 'next/server';

type HealthResponse = {
  status: string;
};

export async function GET(request: NextRequest): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}