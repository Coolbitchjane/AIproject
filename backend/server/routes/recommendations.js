import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { getProfile } from "../helpers.js";
import { recommendFor } from "../sizing.js";
import { recommendationsQuery } from "../schemas.js";

const router = Router();

// GET /api/recommendations?style=formal&limit=8
// Ranks your department's clothes: requested style first, then styles you liked before
router.get("/", requireAuth, validate(recommendationsQuery, "query"), asyncHandler(async (req, res) => {
  const { style, limit } = req.valid.query;
  const profile = await getProfile(req.user.id);
  const { rows: garments } = await query(
    "SELECT id, name, style, size_shift, photo_url FROM garments WHERE department = $1 AND is_active",
    [profile.department]);
  const { rows: liked } = await query(
    `SELECT g.style, COUNT(*)::int AS n FROM tryons t JOIN garments g ON g.id = t.garment_id
      WHERE t.profile_id = $1 AND t.liked GROUP BY g.style`, [profile.id]);
  const likedMap = Object.fromEntries(liked.map((r) => [r.style, Math.min(r.n, 3)]));

  const items = garments
    .map((g) => ({
      id: g.id, name: g.name, style: g.style, photo_url: g.photo_url,
      recommended_size: recommendFor(profile, g).recommended_size,
      score: (style && g.style === style ? 5 : 0) + (likedMap[g.style] || 0),
    }))
    .sort((a, b) => b.score - a.score || (a.name || "").localeCompare(b.name || ""))
    .slice(0, limit);
  res.json({ items });
}));

export default router;
