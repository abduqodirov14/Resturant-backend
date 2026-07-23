import { Router } from "express";
import multer from "multer";
import {
  getMenu,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
  getDeletedFoods,
  restoreFood,
} from "../controllers/menu.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get("/", asyncHandler(getMenu));
router.get("/categories", asyncHandler(getCategories));

// Admin - Foods
router.post("/foods", requireAuth, upload.single("image"), asyncHandler(createFood));
router.patch("/foods/:id", requireAuth, upload.single("image"), asyncHandler(updateFood));
router.delete("/foods/:id", requireAuth, asyncHandler(deleteFood));
router.get("/foods/deleted", requireAuth, asyncHandler(getDeletedFoods));
router.patch("/foods/:id/restore", requireAuth, asyncHandler(restoreFood));

export default router;
