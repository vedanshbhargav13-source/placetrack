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

    source_context: z.string().trim().max(3000).nullable().optional(),

    apply_url: z.string().url().refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Must be an HTTP or HTTPS URL").nullable().optional(),

    location: z.string().optional(),

    work_type: z.enum([
        "remote",
        "hybrid",
        "onsite"
    ]).optional(),

    stipend: z.number().int().min(0).optional(),

    deadline: z.iso.date().nullable().optional()
});
