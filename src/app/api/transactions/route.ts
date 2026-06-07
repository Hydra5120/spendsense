import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.description = { contains: search };
  }
  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(body.amount),
      description: body.description,
      date: new Date(body.date),
      type: body.type,
      category: body.category,
      aiCategorized: body.aiCategorized || false,
      incomeSourceId: body.incomeSourceId || null,
    },
  });

  // Trigger nudge engine after transaction creation
  try {
    await fetch(new URL("/api/nudges", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: transaction.id }),
    });
  } catch {
    // Non-critical — don't fail the transaction creation
  }

  return NextResponse.json(transaction, { status: 201 });
}
