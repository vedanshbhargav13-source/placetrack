import { z } from "zod";

export const interviewSchema = z.object({
    round_type: z.string().trim().min(2).max(50),
    scheduled_at: z.iso.datetime({ offset: true }).nullable().optional(),
    status: z.enum(["Pending", "Scheduled", "Completed", "Cancelled"]).optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    score: z.number().min(0).max(1000).nullable().optional(),
    topics: z.array(z.string().trim().min(1).max(100)).max(100).nullable().optional(),
    questions: z.array(z.string().trim().min(1).max(1000)).max(100).nullable().optional(),
    result: z.string().trim().max(50).nullable().optional(),
    debrief: z.string().trim().max(5000).nullable().optional(),
    feedback: z.string().trim().max(5000).nullable().optional()
});

export const interviewPatchSchema = interviewSchema.partial();
