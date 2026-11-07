import "dotenv/config";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import logger from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import companiesRouter from "./routes/companies.routes.js";
import authRouter from "./routes/auth.routes.js";
import applicationsRouter from "./routes/applications.routes.js";
import profileRouter from "./routes/profile.routes.js";
import jobsRouter from "./routes/jobs.routes.js";
import interviewsRouter from "./routes/interviews.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import todayRouter from "./routes/today.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

// Global middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/companies", companiesRouter);
app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api", interviewsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/dashboard/today", todayRouter);
// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "placetrack-api"
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});