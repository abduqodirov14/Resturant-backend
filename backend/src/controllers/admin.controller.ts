import { Request, Response } from "express";
import { prisma } from "../config/db";

/** Format a Date as YYYY-MM-DD for frontend string comparison */
function toDateKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// GET /api/admin/stats
export async function getStats(_req: Request, res: Response): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRevenue, todayRevenue, totalOrders, preparing, ready] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: "paid" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "paid", paidAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "preparing" } }),
      prisma.order.count({ where: { status: "ready" } }),
    ]);

  res.json({
    revenue: totalRevenue._sum.total || 0,
    todayRevenue: todayRevenue._sum.total || 0,
    orders: totalOrders,
    preparing,
    ready,
  });
}

// GET /api/admin/expenses
export async function getExpenses(req: Request, res: Response): Promise<void> {
  const { date, from, to, limit } = req.query;

  const where: any = {};

  if (date) {
    const d = new Date(String(date));
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    where.expenseDate = { gte: d, lt: nextDay };
  } else if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(String(from));
    if (to) {
      const toDay = new Date(String(to));
      toDay.setDate(toDay.getDate() + 1);
      where.expenseDate.lt = toDay;
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { expenseDate: "desc" },
    take: limit ? Number(limit) : 100,
  });

  // Format expenseDate as YYYY-MM-DD so frontend string comparison works
  const formatted = expenses.map((e) => ({
    ...e,
    expenseDate: toDateKey(new Date(e.expenseDate)),
    createdAt: new Date(e.createdAt).toISOString(),
    updatedAt: new Date(e.updatedAt).toISOString(),
  }));

  res.json({ expenses: formatted });
}

// POST /api/admin/expenses
export async function createExpense(
  req: Request,
  res: Response
): Promise<void> {
  const { amount, description, date } = req.body;

  const expenseDate = date ? new Date(date) : new Date();

  const expense = await prisma.expense.create({
    data: {
      amount: Number(amount),
      description: description || null,
      expenseDate,
    },
  });

  res.status(201).json({
    expense: {
      ...expense,
      expenseDate: toDateKey(new Date(expense.expenseDate)),
      createdAt: new Date(expense.createdAt).toISOString(),
      updatedAt: new Date(expense.updatedAt).toISOString(),
    },
  });
}

// POST /api/admin/close-day
export async function closeDay(req: Request, res: Response): Promise<void> {
  const { date, note } = req.body;

  const closeDate = date ? new Date(date) : new Date();
  closeDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(closeDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await prisma.dayClose.findUnique({
    where: { closeDate },
  });

  if (existing) {
    res.status(400).json({ message: "Day already closed" });
    return;
  }

  const [revenueResult, expenses, orderCount, expenseCount] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: "paid",
        paidAt: { gte: closeDate, lt: nextDay },
      },
      _sum: { total: true },
    }),
    prisma.expense.findMany({
      where: {
        expenseDate: { gte: closeDate, lt: nextDay },
      },
    }),
    prisma.order.count({
      where: {
        status: "paid",
        paidAt: { gte: closeDate, lt: nextDay },
      },
    }),
    prisma.expense.count({
      where: {
        expenseDate: { gte: closeDate, lt: nextDay },
      },
    }),
  ]);

  const totalRevenue = revenueResult._sum.total || 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const dailyClose = await prisma.dayClose.create({
    data: {
      closeDate,
      totalRevenue,
      totalExpense,
      totalProfit: totalRevenue - totalExpense,
      orderCount,
      expenseCount,
      note: note || null,
    },
  });

  res.status(201).json({
    dailyClose: {
      ...dailyClose,
      closeDate: toDateKey(new Date(dailyClose.closeDate)),
      closedAt: new Date(dailyClose.closedAt).toISOString(),
      updatedAt: new Date(dailyClose.updatedAt).toISOString(),
    },
  });
}

// GET /api/admin/day-closes
export async function getDayCloses(
  req: Request,
  res: Response
): Promise<void> {
  const { limit } = req.query;

  const dayCloses = await prisma.dayClose.findMany({
    orderBy: { closeDate: "desc" },
    take: limit ? Number(limit) : 30,
  });

  // Format closeDate as YYYY-MM-DD so frontend string comparison works
  const formatted = dayCloses.map((dc) => ({
    ...dc,
    closeDate: toDateKey(new Date(dc.closeDate)),
    closedAt: new Date(dc.closedAt).toISOString(),
    updatedAt: new Date(dc.updatedAt).toISOString(),
  }));

  res.json({ dayCloses: formatted });
}
