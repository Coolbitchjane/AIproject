import { Router } from "express";
import { query } from "../db.js";
import { HttpError, asyncHandler } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { getProfile, getGarment } from "../helpers.js";
import { fitFor } from "../sizing.js";
import { tryonSchema, likedSchema, idParam } from "../schemas.js";

const router = Router();

// POST /api/tryons  { garment_id, size_tried, liked? }
router.post("/", requireAuth, validate(tryonSchema), asyncHandler(async (req, res) => {
  const { garment_id, size_tried, liked } = req.valid.body;
  const profile = await getProfile(req.user.id);
  const g = await getGarment(garment_id, req.user, profile);
  const f = fitFor(profile, g, size_tried);
  const { rows } = await query(
    `INSERT INTO tryons (profile_id, garment_id, size_tried, fit_result, liked)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, garment_id, size_tried, fit_result, liked, created_at`,
    [profile.id, g.id, size_tried, f.fit, liked ?? null]);
  res.status(201).json({ tryon: rows[0], recommended_size: f.recommended_size, message: f.message });
}));

// GET /api/tryons  -> my try-ons, newest first
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const { rows } = await query(
    `SELECT t.id, t.size_tried, t.fit_result, t.liked, t.created_at,
            g.id AS garment_id, g.name AS garment_name, g.style, g.photo_url
       FROM tryons t JOIN garments g ON g.id = t.garment_id
      WHERE t.profile_id = $1 ORDER BY t.created_at DESC LIMIT 100`, [profile.id]);
  res.json({ items: rows });
}));

// PATCH /api/tryons/:id  { liked }
router.patch("/:id", requireAuth, validate(idParam, "params"), validate(likedSchema), asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const { rows } = await query(
    "UPDATE tryons SET liked = $1 WHERE id = $2 AND profile_id = $3 RETURNING id, liked",
    [req.valid.body.liked, req.valid.params.id, profile.id]);
  if (!rows[0]) throw new HttpError(404, "Try-on not found");
  res.json({ tryon: rows[0] });
}));

export default router;
