import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/api/health" , (req , res) => {
    res.json({
        status: "ok" , 
        service : "placetrack-api"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});

