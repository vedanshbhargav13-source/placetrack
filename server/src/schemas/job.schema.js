import { z } from "zod";

export const jobSchema = z.object({
    title: z.string().trim().min(2).max(150),

    company_id: z.number().int().positive(),

    jd_text: z.string().optional(),

    source: z.enum([
    "linkedin",
    "gmail",
    "college",
    "company_site",
    "referral",
    "other"
]).optional(),

    apply_url: z.string().url().optional(),

    location: z.string().optional(),

    work_type: z.enum([
        "remote",
        "hybrid",
        "onsite"
    ]).optional(),

    stipend: z.number().int().min(0).optional(),

    deadline: z.iso.date().optional()
});