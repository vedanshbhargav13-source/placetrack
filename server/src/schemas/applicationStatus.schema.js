import { z } from "zod";

export const applicationStatusSchema = z.object({
    status: z.enum(["Saved", "Applied", "OA Scheduled", "Interview", "Selected", "Rejected"]),
    note: z.string().trim().max(1000).nullable().optional()
});
