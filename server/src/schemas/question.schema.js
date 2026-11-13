import { z } from "zod";

export const questionSchema = z.object({
    application_id: z.number().int().positive().nullable().optional(),
    round_id: z.number().int().positive().nullable().optional(),
    company_name: z.string().trim().max(160).nullable().optional(),
    role_title: z.string().trim().max(160).nullable().optional(),
    question: z.string().trim().min(3).max(4000),
    topic: z.string().trim().max(100).nullable().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).nullable().optional(),
    notes: z.string().trim().max(3000).nullable().optional()
});

export const questionPatchSchema = questionSchema.partial();
