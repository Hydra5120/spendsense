import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.nudge.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.incomeSource.deleteMany();

  // Income Sources
  const centrelink = await prisma.incomeSource.create({
    data: {
      name: "Youth Allowance (Centrelink)",
      type: "centrelink",
      amount: 640.80,
      frequency: "fortnightly",
    },
  });

  const cafeJob = await prisma.incomeSource.create({
    data: {
      name: "Barista at Campus Cafe",
      type: "casual_work",
      amount: 280,
      frequency: "weekly",
    },
  });

  await prisma.incomeSource.create({
    data: {
      name: "University Merit Scholarship",
      type: "scholarship",
      amount: 1500,
      frequency: "one_off",
    },
  });

  // Budgets for current month
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      { category: "food", limit: 400, month, year },
      { category: "dining_out", limit: 200, month, year },
      { category: "transport", limit: 180, month, year },
      { category: "entertainment", limit: 120, month, year },
      { category: "shopping", limit: 100, month, year },
      { category: "bills", limit: 250, month, year },
      { category: "education", limit: 150, month, year },
    ],
  });

  // Savings Goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        name: "Emergency Fund",
        targetAmount: 2000,
        currentAmount: 450,
        deadline: new Date("2026-12-31"),
        weeklyTarget: 52.5,
      },
      {
        name: "New Laptop",
        targetAmount: 1500,
        currentAmount: 320,
        deadline: new Date("2026-10-15"),
        weeklyTarget: 65.0,
      },
      {
        name: "Summer Holiday",
        targetAmount: 800,
        currentAmount: 120,
        deadline: new Date("2026-12-01"),
        weeklyTarget: 28.0,
      },
    ],
  });

  // Transactions - spread across last 3 months
  const transactions = [];

  // Helper to generate a date in the past N days
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
    return d;
  };

  // Centrelink payments (fortnightly)
  for (let i = 0; i < 6; i++) {
    transactions.push({
      amount: 640.80,
      description: "Centrelink Youth Allowance",
      date: daysAgo(i * 14),
      type: "income" as const,
      category: "income",
      aiCategorized: false,
      incomeSourceId: centrelink.id,
    });
  }

  // Casual work income (weekly)
  for (let i = 0; i < 12; i++) {
    const amount = 240 + Math.random() * 80;
    transactions.push({
      amount: Math.round(amount * 100) / 100,
      description: "Campus Cafe - weekly pay",
      date: daysAgo(i * 7 + 1),
      type: "income" as const,
      category: "income",
      aiCategorized: false,
      incomeSourceId: cafeJob.id,
    });
  }

  // Scholarship
  transactions.push({
    amount: 1500,
    description: "University Merit Scholarship - Semester 1",
    date: daysAgo(45),
    type: "income" as const,
    category: "income",
    aiCategorized: false,
  });

  // Rent
  for (let i = 0; i < 12; i++) {
    transactions.push({
      amount: 250,
      description: "Weekly rent - share house Newtown",
      date: daysAgo(i * 7),
      type: "expense" as const,
      category: "rent",
      aiCategorized: false,
    });
  }

  // Groceries
  const groceryItems = [
    "Woolworths groceries", "Coles weekly shop", "ALDI groceries",
    "Woolworths - fruit and veg", "Coles Express milk and bread",
  ];
  for (let i = 0; i < 20; i++) {
    transactions.push({
      amount: Math.round((30 + Math.random() * 70) * 100) / 100,
      description: groceryItems[Math.floor(Math.random() * groceryItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "food",
      aiCategorized: true,
    });
  }

  // Dining out
  const diningItems = [
    "Uber Eats - Thai food", "Campus cafe lunch", "Maccas drive-thru",
    "Guzman y Gomez burrito", "Dominos pizza", "Sushi Hub",
    "Coffee at Gloria Jeans", "Bubble tea - Gong Cha",
    "Nando's with mates", "Kebab after late lecture",
  ];
  for (let i = 0; i < 15; i++) {
    transactions.push({
      amount: Math.round((8 + Math.random() * 30) * 100) / 100,
      description: diningItems[Math.floor(Math.random() * diningItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "dining_out",
      aiCategorized: true,
    });
  }

  // Transport
  const transportItems = [
    "Opal card top-up", "Uber to uni", "Petrol - 7-Eleven",
    "Bus fare", "Train to city",
  ];
  for (let i = 0; i < 10; i++) {
    transactions.push({
      amount: Math.round((10 + Math.random() * 40) * 100) / 100,
      description: transportItems[Math.floor(Math.random() * transportItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "transport",
      aiCategorized: true,
    });
  }

  // Entertainment
  const entertainmentItems = [
    "Netflix monthly", "Spotify Premium", "Movie tickets - Event Cinemas",
    "PlayStation Store", "Stan subscription", "Concert tickets",
  ];
  for (let i = 0; i < 8; i++) {
    transactions.push({
      amount: Math.round((12 + Math.random() * 40) * 100) / 100,
      description: entertainmentItems[Math.floor(Math.random() * entertainmentItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "entertainment",
      aiCategorized: true,
    });
  }

  // Bills
  const billItems = [
    "Optus mobile plan", "Electricity bill - AGL",
    "Internet - Aussie Broadband", "Water bill",
  ];
  for (let i = 0; i < 6; i++) {
    transactions.push({
      amount: Math.round((30 + Math.random() * 70) * 100) / 100,
      description: billItems[Math.floor(Math.random() * billItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "bills",
      aiCategorized: false,
    });
  }

  // Education
  transactions.push(
    {
      amount: 145,
      description: "Textbooks - Co-op Bookshop",
      date: daysAgo(60),
      type: "expense" as const,
      category: "education",
      aiCategorized: true,
    },
    {
      amount: 25,
      description: "Printing and binding - assignment",
      date: daysAgo(20),
      type: "expense" as const,
      category: "education",
      aiCategorized: true,
    },
    {
      amount: 89,
      description: "Calculator for exams",
      date: daysAgo(35),
      type: "expense" as const,
      category: "education",
      aiCategorized: true,
    }
  );

  // Shopping
  const shoppingItems = [
    "Kmart - household stuff", "Cotton On t-shirt",
    "Big W - stationery", "Target - winter jacket",
  ];
  for (let i = 0; i < 5; i++) {
    transactions.push({
      amount: Math.round((15 + Math.random() * 60) * 100) / 100,
      description: shoppingItems[Math.floor(Math.random() * shoppingItems.length)],
      date: daysAgo(Math.floor(Math.random() * 85)),
      type: "expense" as const,
      category: "shopping",
      aiCategorized: true,
    });
  }

  // Health
  transactions.push(
    {
      amount: 35,
      description: "GP visit - bulk billed remainder",
      date: daysAgo(25),
      type: "expense" as const,
      category: "health",
      aiCategorized: true,
    },
    {
      amount: 12.50,
      description: "Chemist Warehouse - paracetamol",
      date: daysAgo(10),
      type: "expense" as const,
      category: "health",
      aiCategorized: true,
    },
    {
      amount: 59,
      description: "Uni gym membership - monthly",
      date: daysAgo(5),
      type: "expense" as const,
      category: "health",
      aiCategorized: false,
    }
  );

  // Subscriptions
  transactions.push(
    {
      amount: 17.99,
      description: "Netflix Standard",
      date: daysAgo(3),
      type: "expense" as const,
      category: "subscriptions",
      aiCategorized: false,
    },
    {
      amount: 12.99,
      description: "Spotify Premium Student",
      date: daysAgo(7),
      type: "expense" as const,
      category: "subscriptions",
      aiCategorized: false,
    }
  );

  await prisma.transaction.createMany({ data: transactions });

  // Welcome nudge
  await prisma.nudge.create({
    data: {
      type: "daily_tip",
      title: "Welcome to SpendSense!",
      message: "Start by reviewing your transactions and setting monthly budgets for each category.",
    },
  });

  console.log("Seed complete! Created:");
  console.log(`  - 3 income sources`);
  console.log(`  - 7 budgets`);
  console.log(`  - 3 savings goals`);
  console.log(`  - ${transactions.length} transactions`);
  console.log(`  - 1 welcome nudge`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
