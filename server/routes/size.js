import { Router } from "express";
import { asyncHandler } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { getProfile, getGarment } from "../helpers.js";
import { SIZES, recommendFor, fitFor } from "../sizing.js";
import { sizeRecommendQuery, sizeAdjustSchema } from "../schemas.js";

const router = Router();

// GET /api/size/recommend?garment_id=...
router.get("/recommend", requireAuth, validate(sizeRecommendQuery, "query"), asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  const g = await getGarment(req.valid.query.garment_id, req.user, profile);
  res.json(recommendFor(profile, g));
}));

// POST /api/size/adjust  { garment_id, size }  -> how that size fits, plus every size's fit
router.post("/adjust", requireAuth, validate(sizeAdjustSchema), asyncHandler(async (req, res) => {
  const { garment_id, size } = req.valid.body;
  const profile = await getProfile(req.user.id);
  const g = await getGarment(garment_id, req.user, profile);
  const result = fitFor(profile, g, size);
  const options = SIZES.map((s) => ({ size: s, fit: fitFor(profile, g, s).fit }));
  res.json({ ...result, size, options });
}));

export default router;
