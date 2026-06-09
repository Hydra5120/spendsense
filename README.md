# SpendSense

AI-powered personal finance tracker. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma + SQLite, and Gemini.

## Features

- **Dashboard** — balance overview, spending donut chart, trend line, AI financial health score, daily AI nudge, proactive smart alerts
- **Transactions** — manual entry, CSV import with AI auto-categorisation, search/filter by category/type/date
- **Budgets** — per-category monthly limits with colour-coded progress bars
- **SpendSense Chat** — streaming AI chat with your financial data as context
- **Income Tracker** — Centrelink, casual work, scholarships; income vs expenses chart
- **Savings Goals** — AI-calculated weekly savings targets, progress tracking
- **Dark Mode** — toggle in the sidebar

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier available)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Hydra5120/spendsense
   
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root:

   ```
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

   Replace `your-gemini-api-key-here` with your actual Gemini API key.

4. **Set up the database** (creates the SQLite database, runs migrations, and seeds sample data):

   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | Next.js 15 (App Router), TypeScript     |
| Styling   | Tailwind CSS v4, shadcn/ui             |
| Database  | Prisma ORM, SQLite                      |
| AI        | Gemini 3.1 Flash Lite                 |
| Charts    | Recharts                                |
| CSV       | PapaParse                               |

## Notes

- The app works without a Gemini API key but AI features (chat, auto-categorisation, health score, nudges) will fall back to generic messages.
- No authentication (yet)
