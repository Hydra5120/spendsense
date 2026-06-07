import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sources = await prisma.incomeSource.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const source = await prisma.incomeSource.create({
    data: {
      name: body.name,
      type: body.type,
      amount: parseFloat(body.amount),
      frequency: body.frequency,
    },
  });

  return NextResponse.json(source, { status: 201 });
}
