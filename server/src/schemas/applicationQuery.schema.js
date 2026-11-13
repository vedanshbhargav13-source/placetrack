
import { z } from "zod";

export const applicationQuerySchema = z.object({
    q: z.string().trim().optional(),

    status: z.enum([
        "Saved",
        "Applied",
        "OA Scheduled",
        "Interview",
        "Selected",
        "Rejected"
    ]).optional(),

    sort: z.enum([
        "applied_at",
        "updated_at"
    ]).default("applied_at"),

    order: z.enum([
        "asc",
        "desc"
    ]).default("desc"),

    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10)
});

