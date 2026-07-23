import { Router } from "express";
import { getTables, createTable, deleteTable } from "../controllers/tables.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getTables));
router.post("/", requireAuth, asyncHandler(createTable));
router.delete("/:id", requireAuth, asyncHandler(deleteTable));

export default router;
