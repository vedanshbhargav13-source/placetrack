import { z } from "zod";

export const actionSchema = z.object({
    title: z.string().trim().min(1).max(180),
    details: z.string().trim().max(3000).nullable().optional(),
    kind: z.enum(["task", "follow_up", "prep", "form_resume", "recovery"]).default("task"),
    state: z.enum(["open", "waiting", "blocked", "done"]).default("open"),
    due_at: z.iso.datetime({ offset: true }).nullable().optional(),
    deadline_offset_days: z.number().int().min(-365).max(365).nullable().optional(),
    waiting_on: z.string().trim().max(300).nullable().optional()
});

export const actionPatchSchema = actionSchema.partial();
