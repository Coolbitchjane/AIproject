import "./config.js";
import express from "express";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./errors.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import garmentRoutes from "./routes/garments.js";
import sizeRoutes from "./routes/size.js";
import recommendationRoutes from "./routes/recommendations.js";
import styleMatchRoutes from "./routes/stylematch.js";
import tryonRoutes from "./routes/tryons.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/style-match", styleMatchRoutes);
app.use("/api/tryons", tryonRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
