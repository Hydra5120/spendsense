import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJsonModel } from "@/lib/gemini";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

async function categorizeDescriptions(
  descriptions: string[]
): Promise<string[]> {
  const categoryList = EXPENSE_CATEGORIES.join(", ");
  const prompt = `Categorize each of these transaction descriptions into exactly one of these categories: ${categoryList}.

Transactions:
${descriptions.map((d, i) => `${i + 1}. "${d}"`).join("\n")}

Return a JSON array of objects: [{"index": 1, "category": "food"}, ...]
Each category must be one of: ${categoryList}`;

  try {
    const result = await geminiJsonModel.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return descriptions.map((_, i) => {
      const match = parsed.find(
        (p: { index: number; category: string }) => p.index === i + 1
      );
      return match?.category || "other";
    });
  } catch {
    return descriptions.map(() => "other");
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const transactions: {
    date: string;
    description: string;
    amount: number;
    type: "income" | "expense";
  }[] = body.transactions;

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ error: "No transactions" }, { status: 400 });
  }

  const batchSize = 10;
  const results = [];

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const expenseBatch = batch.filter((t) => t.type === "expense");
    const expenseDescriptions = expenseBatch.map((t) => t.description);

    let categories: string[] = [];
    if (expenseDescriptions.length > 0) {
      categories = await categorizeDescriptions(expenseDescriptions);
    }

    let catIdx = 0;
    const data = batch.map((t) => ({
      amount: t.amount,
      description: t.description,
      date: new Date(t.date),
      type: t.type,
      category: t.type === "income" ? "income" : categories[catIdx++] || "other",
      aiCategorized: t.type === "expense",
    }));

    const created = await prisma.transaction.createMany({ data });
    results.push(created);
  }

  const totalCreated = results.reduce((sum, r) => sum + r.count, 0);
  return NextResponse.json({ imported: totalCreated });
}
