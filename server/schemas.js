import { z } from "zod";

export const SIZE_LIST = ["XS", "S", "M", "L", "XL", "XXL"];
const size = z.enum(SIZE_LIST);
const department = z.enum(["women", "men", "kids"]);
const style = z.enum(["casual", "formal", "sporty"]);
const uuid = z.string().uuid("must be a valid id");

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("must be a valid email").max(254),
  password: z.string().min(8, "must be at least 8 characters").max(72, "must be at most 72 characters")
    .regex(/[A-Za-z]/, "must contain a letter").regex(/[0-9]/, "must contain a number"),
  department,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("must be a valid email"),
  password: z.string().min(1, "is required").max(72),
});

export const profileSchema = z.object({
  height_cm: z.number().min(50).max(250),
  chest_cm: z.number().min(40).max(200),
  waist_cm: z.number().min(30).max(200),
  hips_cm: z.number().min(40).max(220),
  usual_size: size,
}).partial().refine((o) => Object.keys(o).length > 0, { message: "Send at least one field" });

export const idParam = z.object({ id: uuid });
export const garmentsQuery = z.object({ department: department.optional(), style: style.optional() });
export const garmentSchema = z.object({
  department, style,
  name: z.string().trim().min(2).max(80),
  size_shift: z.number().int().min(-6).max(6).default(0),
  photo_url: z.string().url().max(500).optional(),
});
export const sizeRecommendQuery = z.object({ garment_id: uuid });
export const sizeAdjustSchema = z.object({ garment_id: uuid, size });
export const recommendationsQuery = z.object({
  style: style.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});
export const styleMatchQuery = z.object({ garment_id: uuid });
export const tryonSchema = z.object({ garment_id: uuid, size_tried: size, liked: z.boolean().optional() });
export const likedSchema = z.object({ liked: z.boolean() });
