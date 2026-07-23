import { Router } from "express";
import {
  getStats,
  getExpenses,
  createExpense,
  closeDay,
  getDayCloses,
} from "../controllers/admin.controller";
import { createCategory } from "../controllers/menu.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/stats", requireAuth, asyncHandler(getStats));
router.get("/expenses", requireAuth, asyncHandler(getExpenses));
router.post("/expenses", requireAuth, asyncHandler(createExpense));
router.post("/close-day", requireAuth, asyncHandler(closeDay));
router.get("/day-closes", requireAuth, asyncHandler(getDayCloses));
router.post("/categories", requireAuth, asyncHandler(createCategory));

export default router;
