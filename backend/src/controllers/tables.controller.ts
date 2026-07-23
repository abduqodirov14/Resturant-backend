import { Request, Response } from "express";
import { prisma } from "../config/db";
import QRCode from "qrcode";

// GET /api/tables
export async function getTables(_req: Request, res: Response): Promise<void> {
  const tables = await prisma.table.findMany({
    orderBy: { number: "asc" },
  });

  res.json({ tables });
}

// POST /api/tables
export async function createTable(req: Request, res: Response): Promise<void> {
  const { number } = req.body;

  const existing = await prisma.table.findUnique({
    where: { number: Number(number) },
  });

  if (existing) {
    res.status(400).json({ message: "Table number already exists" });
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5173";
  const qrData = `${baseUrl}/menu?table=${number}`;
  const qrCode = await QRCode.toDataURL(qrData);

  const table = await prisma.table.create({
    data: {
      number: Number(number),
      qrCode,
    },
  });

  res.status(201).json({ table });
}

// DELETE /api/tables/:id
export async function deleteTable(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const table = await prisma.table.findUnique({
    where: { id: Number(id) },
    include: { orders: true },
  });

  if (!table) {
    res.status(404).json({ message: "Table not found" });
    return;
  }

  const removedOrders = table.orders.length;

  await prisma.orderItem.deleteMany({
    where: { order: { tableId: Number(id) } },
  });
  await prisma.order.deleteMany({
    where: { tableId: Number(id) },
  });
  await prisma.table.delete({
    where: { id: Number(id) },
  });

  res.json({ removedOrders });
}
