import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// JWT token дотор хадгалах өгөгдөл
export interface JwtPayload {
  userId: string;
  email: string;
}

// Express Request дээр user талбар нэмж өгнө
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Token үүсгэх туслах функц
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Authorization header-ээс token-ийг шалгаж, зөв бол user-ийг request-д онооно
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нэвтрэх шаардлагатай (token алга)" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token буруу эсвэл хугацаа дууссан" });
  }
}
