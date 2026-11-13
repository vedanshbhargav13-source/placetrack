import { z } from "zod";

export const followupSchema = z.object({
    follow_up_due_at: z.iso.datetime({ offset: true }).nullable(),
    last_response_at: z.iso.datetime({ offset: true }).nullable().optional(),
    waiting_on: z.string().trim().max(300).nullable().optional()
});
