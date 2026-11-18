import { HttpError } from "./errors.js";

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
// Chest cm where the next size starts. These are starting values: tune them to your size chart.
const CHEST = { women: [82, 88, 94, 100, 108], men: [88, 96, 104, 112, 120], kids: [60, 66, 72, 78, 84] };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function baseIndex(profile) {
  if (profile.chest_cm !== null && profile.chest_cm !== undefined) {
    const chest = Number(profile.chest_cm);
    const steps = CHEST[profile.department] || CHEST.women;
    let i = 0;
    while (i < steps.length && chest >= steps[i]) i++;
    return i;
  }
  if (profile.usual_size) return SIZES.indexOf(profile.usual_size);
  throw new HttpError(400, "Please save your chest measurement or usual size first");
}

// size_shift: negative = runs small (go up a size), positive = runs large (go down). 2 units = 1 size.
export function recommendFor(profile, garment) {
  const base = baseIndex(profile);
  const idx = clamp(base - Math.round((garment.size_shift || 0) / 2), 0, SIZES.length - 1);
  return { base_size: SIZES[base], recommended_size: SIZES[idx] };
}

export function fitFor(profile, garment, size) {
  const { recommended_size } = recommendFor(profile, garment);
  const diff = SIZES.indexOf(size) - SIZES.indexOf(recommended_size);
  const fit = diff < 0 ? "tight" : diff > 0 ? "loose" : "perfect";
  const message = fit === "perfect"
    ? `Size ${size} should fit you perfectly.`
    : `Size ${size} will probably feel ${fit}. We suggest size ${recommended_size}.`;
  return { recommended_size, fit, message };
}
