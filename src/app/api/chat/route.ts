import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { geminiChatModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  if (!message) {
    return new Response("Message required", { status: 400 });
  }

  await prisma.chatMessage.create({
    data: { role: "user", content: message },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [transactions, budgets, goals, recentMessages] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: startOfMonth } },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.budget.findMany({
      where: { month: now.getMonth() + 1, year: now.getFullYear() },
    }),
    prisma.savingsGoal.findMany(),
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
    .join(", ");

  const budgetStatus = budgets
    .map((b) => {
      const spent = categoryTotals[b.category] || 0;
      const pct = Math.round((spent / b.limit) * 100);
      return `${b.category}: $${spent.toFixed(2)}/$${b.limit.toFixed(2)} (${pct}%)`;
    })
    .join(", ");

  const goalsStatus = goals
    .map((g) => `${g.name}: $${g.currentAmount}/$${g.targetAmount}`)
    .join(", ");

  const systemPrompt = `You are SpendSense, a helpful and encouraging financial assistant for an Australian university student.

Current financial snapshot:
- Balance this month: $${(totalIncome - totalExpenses).toFixed(2)}
- Income this month: $${totalIncome.toFixed(2)}
- Expenses this month: $${totalExpenses.toFixed(2)}
- Top spending categories: ${topCategories || "None yet"}
- Budget status: ${budgetStatus || "No budgets set"}
- Savings goals: ${goalsStatus || "No goals set"}

Recent transactions: ${transactions.slice(0, 10).map((t) => `${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)} ${t.description} (${t.category})`).join(", ") || "None"}

Guidelines:
- Be encouraging and supportive
- Reference Australian context (AUD, Centrelink, HECS-HELP, campus life)
- Give specific, actionable advice based on the data above
- Keep responses concise (2-3 paragraphs max)
- Use dollar amounts from the data when relevant`;

  const history = recentMessages
    .reverse()
    .slice(0, -1)
    .map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    }));

  try {
    const chat = geminiChatModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'm SpendSense, ready to help with your finances!" }] },
        ...history,
      ],
    });

    const result = await chat.sendMessageStream(message);

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }

          await prisma.chatMessage.create({
            data: { role: "assistant", content: fullResponse },
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    const fallback = "I'm having trouble connecting right now. Please try again in a moment!";

    await prisma.chatMessage.create({
      data: { role: "assistant", content: fallback },
    });

    return new Response(fallback);
  }
}
