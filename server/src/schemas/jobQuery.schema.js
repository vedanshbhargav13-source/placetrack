import { z } from "zod";

export const jobQuerySchema = z.object({
    q: z.string().trim().optional(),

    company_id: z.coerce.number().int().positive().optional(),

    work_type: z.enum([
        "remote",
        "hybrid",
        "onsite"
    ]).optional(),

    deadline_before: z.iso.date().optional(),

    sort: z.enum([
        "deadline",
        "created_at"
    ]).default("created_at"),

    order: z.enum([
        "asc",
        "desc"
    ]).default("desc"),

    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10)
});