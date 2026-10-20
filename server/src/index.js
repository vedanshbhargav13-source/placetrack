import express from "express";
import dotenv from "dotenv";
import logger from "./middleware/logger.js";
import companiesRouter from "./routes/companies.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(logger);

app.use("/api/companies", companiesRouter);


app.get("/api/health" , (req , res) => {
    res.json({
        status: "ok" , 
        service : "placetrack-api"
    });
});


app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});

