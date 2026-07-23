import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err.message);
  console.error(err.stack);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}
