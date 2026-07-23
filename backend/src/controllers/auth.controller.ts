import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (username === "admin" && password === process.env.ADMIN_TOKEN) {
    const token = jwt.sign(
      { id: 0, username: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    res.json({ token, user: { id: 0, username: "admin" } });
    return;
  }

  res.status(401).json({ message: "Invalid credentials" });
}
