import { getIO } from "../config/socket";

/**
 * Serialize a Prisma order (with Date objects) into a plain JSON object
 * that matches the frontend Order type exactly.
 */
function serializeOrder(order: any): any {
  return {
    ...order,
    status: String(order.status || "").toLowerCase(),
    totalPrice: order.total,
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
    paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
    items: (order.items || []).map((item: any) => ({
      ...item,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
      food: {
        ...item.food,
        nameUz: item.food.name,
        descriptionUz: item.food.description || "",
        image: item.food.imageUrl || null,
        categoryUz: item.food.category?.name || item.food.categoryName || "",
        available: item.food.isAvailable ?? true,
      },
    })),
  };
}

export function emitNewOrder(order: any): void {
  const io = getIO();
  if (!io) return;

  const data = serializeOrder(order);
  io.to("chef-room").emit("new_order", data);
  io.to("admin-room").emit("new_order", data);
}

export function emitOrderStatusUpdate(order: any): void {
  const io = getIO();
  if (!io) return;

  const data = serializeOrder(order);
  io.to("chef-room").emit("order_status_updated", data);
  io.to("admin-room").emit("order_status_updated", data);
}

export function emitOrderPaid(order: any): void {
  const io = getIO();
  if (!io) return;

  const data = serializeOrder(order);
  io.to("admin-room").emit("order_paid", data);
}
