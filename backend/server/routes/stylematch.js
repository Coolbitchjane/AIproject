import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { getProfile, getGarment } from "../helpers.js";
import { recommendFor } from "../sizing.js";
import { styleMatchQuery } from "../schemas.js";

const router = Router();
const COMPATIBLE = { casual: ["sporty"], sporty: ["casual"], formal: [] };

// GET /api/style-match?garment_id=...  -> other pieces that go with this one
router.get("/", requireAuth, validate(styleMatchQuery, "query"), asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const base = await getGarment(req.valid.query.garment_id, req.user, profile);
  const { rows } = await query(
    `SELECT id, name, style, size_shift, photo_url FROM garments
      WHERE department = $1 AND is_active AND id <> $2`, [base.department, base.id]);

  const items = rows
    .map((g) => {
      const match = g.style === base.style ? 3 : (COMPATIBLE[base.style] || []).includes(g.style) ? 2 : 0;
      return { id: g.id, name: g.name, style: g.style, photo_url: g.photo_url,
               recommended_size: recommendFor(profile, g).recommended_size, match };
    })
    .filter((g) => g.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 6);
  res.json({ base: { id: base.id, name: base.name, style: base.style }, items });
}));

export default router;
