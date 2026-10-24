    import express from "express";

    import {
        listCompanies,
        createCompany,
        getCompany,
        updateCompany,
        deleteCompany
    } from "../controllers/companies.controller.js";

    import validate from "../middleware/validate.js";
    import { companySchema } from "../schemas/company.schema.js";

    const router = express.Router();

    router.get("/", listCompanies);

    router.post("/", validate(companySchema), createCompany);

    router.put("/:id", validate(companySchema), updateCompany);

    router.get("/:id", getCompany);

    router.delete("/:id", deleteCompany);

    export default router;