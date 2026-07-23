import { Request, Response } from "express";
import { prisma } from "../config/db";
import { emitNewOrder, emitOrderStatusUpdate, emitOrderPaid } from "../services/socket.service";

/** Add unitPrice and lineTotal to order items for frontend compatibility */
function enrichOrderItems(items: any[]): any[] {
  return items.map((item: any) => ({
    ...item,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
  }));
}

// POST /api/orders
export async function createOrder(req: Request, res: Response): Promise<void> {
  const { tableId, tableNumber, items, note } = req.body;

  let resolvedTableId = tableId;

  if (!resolvedTableId && tableNumber) {
    const table = await prisma.table.findUnique({
      where: { number: Number(tableNumber) },
    });
    if (!table) {
      res.status(400).json({ message: "Table not found" });
      return;
    }
    resolvedTableId = table.id;
  }

  if (!resolvedTableId || !items || !items.length) {
    res.status(400).json({ message: "tableId/tableNumber and items are required" });
    return;
  }

  const foodIds = items.map((item: any) => Number(item.foodId));
  const foods = await prisma.food.findMany({
    where: { id: { in: foodIds } },
  });

  const foodMap = new Map(foods.map((f) => [f.id, f]));

  let total = 0;
  const orderItems = items.map((item: any) => {
    const food = foodMap.get(Number(item.foodId));
    const price = food?.price || 0;
    total += price * Number(item.quantity);
    return {
      foodId: Number(item.foodId),
      quantity: Number(item.quantity),
      price,
    };
  });

  const order = await prisma.order.create({
    data: {
      tableId: Number(resolvedTableId),
      total,
      note: note || null,
      items: {
        create: orderItems,
      },
    },
    include: {
      table: true,
      items: {
        include: { food: { include: { category: true } } },
      },
    },
  });

  emitNewOrder(order);

  res.status(201).json({
    order: {
      ...order,
      items: enrichOrderItems(order.items),
    },
  });
}

// GET /api/orders
export async function getOrders(req: Request, res: Response): Promise<void> {
  const { status, limit, page, details } = req.query;

  const take = limit ? Number(limit) : 100;
  const skip = page ? (Number(page) - 1) * take : 0;

  const where: any = {};
  if (status) {
    where.status = String(status).toLowerCase();
  }

  const include: any = {
    table: true,
    items: details === "true" ? { include: { food: { include: { category: true } } } } : true,
  };

  const orders = await prisma.order.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  // Enrich items with unitPrice and lineTotal
  const enriched = orders.map((o) => ({
    ...o,
    items: enrichOrderItems(o.items),
  }));

  res.json({ orders: enriched });
}

// GET /api/orders/summary
export async function getOrderSummary(
  _req: Request,
  res: Response
): Promise<void> {
  const [pending, preparing, ready] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "preparing" } }),
    prisma.order.count({ where: { status: "ready" } }),
  ]);

  res.json({
    counts: { pending, preparing, ready },
    updatedAt: new Date().toISOString(),
  });
}

// GET /api/orders/:id
export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      table: true,
      items: { include: { food: { include: { category: true } } } },
    },
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({
    order: {
      ...order,
      items: enrichOrderItems(order.items),
    },
  });
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "preparing", "ready", "paid", "cancelled"];
  const normalizedStatus = String(status).toLowerCase();

  if (!validStatuses.includes(normalizedStatus)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status: normalizedStatus as any },
    include: {
      table: true,
      items: { include: { food: { include: { category: true } } } },
    },
  });

  emitOrderStatusUpdate(order);

  res.json({
    order: {
      ...order,
      items: enrichOrderItems(order.items),
    },
  });
}

// POST /api/orders/:id/pay
export async function payOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      table: true,
      items: { include: { food: { include: { category: true } } } },
    },
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  if (order.paidAt) {
    res.status(400).json({ message: "Order already paid" });
    return;
  }

  const now = new Date();

  const updatedOrder = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      status: "paid",
      paidAt: now,
    },
    include: {
      table: true,
      items: { include: { food: { include: { category: true } } } },
    },
  });

  const receiptNo = `RCP-${order.id}-${Date.now()}`;
  const receipt = {
    receiptNo,
    orderId: order.id,
    tableNumber: order.table.number,
    issuedAt: order.createdAt.toISOString(),
    paidAt: now.toISOString(),
    total: order.total,
    lines: order.items.map((item) => ({
      foodId: item.foodId,
      name: item.food.name,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
    })),
  };

  emitOrderPaid(updatedOrder);

  res.json({
    order: {
      ...updatedOrder,
      items: enrichOrderItems(updatedOrder.items),
    },
    receipt,
  });
}
