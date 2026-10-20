import express from "express"; 
import { listCompanies , createCompany , getCompany , updateCompany  , deleteCompany} from "../controllers/companies.controller.js";

const router = express.Router();

router.get("/" , listCompanies);
router.post("/" , createCompany);
router.put("/:id" , updateCompany);
router.get("/:id" , getCompany);
router.delete("/:id" , deleteCompany);

export default router;

