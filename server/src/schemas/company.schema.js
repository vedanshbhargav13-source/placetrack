import { z } from "zod";

export const companySchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Company name is required")
        .max(100, "Company name must not exceed 100 characters"),

    website: z.string().nullable().optional(),

    location: z.string().nullable().optional(),

    notes: z.string().nullable().optional()
});