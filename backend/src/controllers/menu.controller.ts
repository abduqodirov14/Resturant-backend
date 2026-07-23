import { Request, Response } from "express";
import { prisma } from "../config/db";
import { uploadImage } from "../config/blob";

// GET /api/menu
export async function getMenu(_req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    include: {
      foods: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  res.json({ categories });
}

// GET /api/menu/categories
export async function getCategories(
  _req: Request,
  res: Response
): Promise<void> {
  const categories = await prisma.category.findMany({
    include: {
      foods: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  res.json({ categories });
}

// POST /api/menu/foods
export async function createFood(req: Request, res: Response): Promise<void> {
  const { name, description, price, categoryId, isAvailable } = req.body;

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
  }

  const food = await prisma.food.create({
    data: {
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(price),
      categoryId: Number(categoryId),
      isAvailable: isAvailable === "true" || isAvailable === true,
      imageUrl: imageUrl || null,
    },
    include: { category: true },
  });

  res.status(201).json({ food });
}

// PATCH /api/menu/foods/:id
export async function updateFood(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, description, price, categoryId, isAvailable } = req.body;

  const existing = await prisma.food.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    res.status(404).json({ message: "Food not found" });
    return;
  }

  let imageUrl = existing.imageUrl;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
  }

  const food = await prisma.food.update({
    where: { id: Number(id) },
    data: {
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(price),
      categoryId: Number(categoryId),
      isAvailable: isAvailable === "true" || isAvailable === true,
      imageUrl: imageUrl || null,
    },
    include: { category: true },
  });

  res.json({ food });
}

// DELETE /api/menu/foods/:id
export async function deleteFood(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const food = await prisma.food.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
    include: { category: true },
  });

  res.json({ food });
}

// GET /api/menu/foods/deleted
export async function getDeletedFoods(
  _req: Request,
  res: Response
): Promise<void> {
  const foods = await prisma.food.findMany({
    where: { deletedAt: { not: null } },
    include: { category: true },
    orderBy: { deletedAt: "desc" },
  });

  res.json({ foods });
}

// PATCH /api/menu/foods/:id/restore
export async function restoreFood(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const food = await prisma.food.update({
    where: { id: Number(id) },
    data: { deletedAt: null },
    include: { category: true },
  });

  res.json({ food });
}

// POST /api/admin/categories
export async function createCategory(
  req: Request,
  res: Response
): Promise<void> {
  const { name } = req.body;

  const category = await prisma.category.create({
    data: { name: String(name).trim() },
  });

  res.status(201).json({ category });
}
