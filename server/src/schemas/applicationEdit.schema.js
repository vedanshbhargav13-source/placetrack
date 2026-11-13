import { z } from "zod";

export const applicationEditSchema = z.object({
    notes: z.string().trim().max(5000).nullable().optional(),
    resume_label: z.string().trim().max(160).nullable().optional(),
    follow_up_due_at: z.iso.datetime({ offset: true }).nullable().optional(),
    last_response_at: z.iso.datetime({ offset: true }).nullable().optional(),
    waiting_on: z.string().trim().max(300).nullable().optional()
}).refine(data => Object.keys(data).length > 0, "Provide at least one field to update");
