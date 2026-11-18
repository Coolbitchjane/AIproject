import { query } from "./db.js";
import { HttpError } from "./errors.js";

export async function getProfile(userId) {
  const { rows } = await query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
  if (!rows[0]) throw new HttpError(404, "Profile not found");
  return rows[0];
}

// Department role check: customers can only use their own department, admins can use all
export async function getGarment(id, user, profile) {
  const { rows } = await query(
    "SELECT id, department, name, style, size_shift, photo_url FROM garments WHERE id = $1 AND is_active", [id]);
  const g = rows[0];
  if (!g) throw new HttpError(404, "Garment not found");
  if (user.role !== "admin" && g.department !== profile.department) {
    throw new HttpError(403, `Your account can only use the ${profile.department} department`);
  }
  return g;
}
