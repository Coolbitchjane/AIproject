// Reads from req.body / req.query / req.params and puts clean data in req.valid
export const validate = (schema, where = "body") => (req, res, next) => {
  const result = schema.safeParse(req[where]);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  req.valid = req.valid || {};
  req.valid[where] = result.data;
  next();
};
