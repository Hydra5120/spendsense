import { NextRequest, NextResponse } from "next/server";
import { geminiJsonModel } from "@/lib/gemini";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

export async function POST(request: NextRequest) {
  const { description } = await request.json();

  if (!description) {
    return NextResponse.json({ category: "other" });
  }

  const categoryList = EXPENSE_CATEGORIES.join(", ");

  try {
    const result = await geminiJsonModel.generateContent(
      `Categorize this transaction description into exactly one category.

Description: "${description}"

Valid categories: ${categoryList}

Return JSON: {"category": "<one of the valid categories>"}`
    );

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const category = EXPENSE_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "other";

    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ category: "other" });
  }
}
