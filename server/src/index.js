import "dotenv/config";

import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
import actionsRouter from "./routes/actions.routes.js";
import plannerRouter from "./routes/planner.routes.js";
import questionsRouter from "./routes/questions.routes.js";
import compareRouter from "./routes/compare.routes.js";
import followupsRouter from "./routes/followups.routes.js";
import calendarRouter from "./routes/calendar.routes.js";
import opportunitiesRouter from "./routes/opportunities.routes.js";
import discoveryRouter from "./routes/discovery.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

// Global middleware
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",").map(origin => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
} }));

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
app.use("/api", actionsRouter);
app.use("/api/dashboard", plannerRouter);
app.use("/api/questions", questionsRouter);
app.use("/api", compareRouter);
app.use("/api", followupsRouter);
app.use("/api", calendarRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/discovery", discoveryRouter);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
