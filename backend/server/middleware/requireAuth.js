import jwt from "jsonwebtoken";
import { HttpError } from "../errors.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next(new HttpError(401, "Please log in first"));
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = { id: p.sub, role: p.role };
    next();
  } catch {
    next(new HttpError(401, "Your session expired. Please log in again"));
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : next(new HttpError(403, "You do not have permission to do that"));
