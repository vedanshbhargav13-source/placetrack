import express from "express"; 
import { listCompanies , createCompany , getCompany } from "../controllers/companies.controller.js";

const router = express.Router();

router.get("/" , listCompanies);
router.post("/" , createCompany);
router.get("/:id" , getCompany);

export default router;

