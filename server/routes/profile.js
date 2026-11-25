import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../errors.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../schemas.js";

const router = Router();
const num = (v) => (v === null ? null : Number(v));
const shape = (p) => ({
  id: p.id, department: p.department, usual_size: p.usual_size,
  height_cm: num(p.height_cm), chest_cm: num(p.chest_cm),
  waist_cm: num(p.waist_cm), hips_cm: num(p.hips_cm), updated_at: p.updated_at,
});

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM profiles WHERE user_id = $1", [req.user.id]);
  res.json({ profile: shape(rows[0]) });
}));

// Department is fixed at sign-up, so it is not editable here
router.put("/", requireAuth, validate(profileSchema), asyncHandler(async (req, res) => {
  const data = req.valid.body;               // only whitelisted keys survive validation
  const cols = Object.keys(data);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
  const { rows } = await query(
    `UPDATE profiles SET ${set}, updated_at = now() WHERE user_id = $${cols.length + 1} RETURNING *`,
    [...cols.map((c) => data[c]), req.user.id]);
  res.json({ profile: shape(rows[0]) });
}));

export default router;
