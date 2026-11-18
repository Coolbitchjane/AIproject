import { Router } from "express";
import { query } from "../db.js";
import { HttpError, asyncHandler } from "../errors.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { getProfile, getGarment } from "../helpers.js";
import { garmentsQuery, garmentSchema, idParam } from "../schemas.js";

const router = Router();

// GET /api/garments?style=casual   (customers see only their department)
router.get("/", requireAuth, validate(garmentsQuery, "query"), asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const { department, style } = req.valid.query;
  let dept = profile.department;
  if (req.user.role === "admin") dept = department || null;
  else if (department && department !== profile.department) {
    throw new HttpError(403, `Your account can only browse the ${profile.department} department`);
  }
  const { rows } = await query(
    `SELECT id, department, name, style, photo_url FROM garments
      WHERE is_active AND ($1::text IS NULL OR department = $1) AND ($2::text IS NULL OR style = $2)
      ORDER BY name`, [dept, style || null]);
  res.json({ items: rows });
}));

router.get("/:id", requireAuth, validate(idParam, "params"), asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const g = await getGarment(req.valid.params.id, req.user, profile);
  res.json({ garment: { id: g.id, department: g.department, name: g.name, style: g.style, photo_url: g.photo_url } });
}));

// POST /api/garments  (admin only) adds clothes to the catalog
router.post("/", requireAuth, requireRole("admin"), validate(garmentSchema), asyncHandler(async (req, res) => {
  const g = req.valid.body;
  const { rows } = await query(
    `INSERT INTO garments (department, name, style, size_shift, photo_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, department, name, style, size_shift, photo_url`,
    [g.department, g.name, g.style, g.size_shift, g.photo_url || null]);
  res.status(201).json({ garment: rows[0] });
}));

export default router;
