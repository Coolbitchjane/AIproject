import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, query } from "../db.js";
import { BCRYPT_ROUNDS } from "../config.js";
import { HttpError, asyncHandler } from "../errors.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { registerSchema, loginSchema } from "../schemas.js";

const router = Router();
// Used so a wrong email takes as long as a wrong password (stops email guessing)
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

function sendToken(res, user) {
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user.id, expiresIn: "7d", algorithm: "HS256",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

// POST /api/auth/register  -> creates the user and their profile together
router.post("/register", validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, department } = req.valid.body;
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const u = await client.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at",
      [email, hash]
    );
    await client.query("INSERT INTO profiles (user_id, department) VALUES ($1, $2)", [u.rows[0].id, department]);
    await client.query("COMMIT");
    sendToken(res, u.rows[0]);
    res.status(201).json({ user: { ...u.rows[0], department } });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") throw new HttpError(409, "An account with this email already exists");
    throw err;
  } finally {
    client.release();
  }
}));

// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;
  const { rows } = await query(
    `SELECT u.id, u.email, u.role, u.password_hash, u.is_active, p.department
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE lower(u.email) = $1`, [email]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Invalid email or password");
  if (!user.is_active) throw new HttpError(403, "This account is disabled");
  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
  sendToken(res, user);
  res.json({ user: { id: user.id, email: user.email, role: user.role, department: user.department } });
}));

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.email, u.role, p.department
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`, [req.user.id]);
  if (!rows[0]) throw new HttpError(401, "Account not found. Please log in again");
  res.json({ user: rows[0] });
}));

export default router;
