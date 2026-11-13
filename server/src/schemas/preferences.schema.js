import { z } from "zod";

const weights = z.object({
    skills: z.number().min(0).max(100), role: z.number().min(0).max(100),
    work_type: z.number().min(0).max(100), location: z.number().min(0).max(100),
    stipend: z.number().min(0).max(100), deadline: z.number().min(0).max(100)
}).refine(value => Object.values(value).reduce((sum, n) => sum + n, 0) > 0, "At least one priority must be above zero");

export const preferencesSchema = z.object({
    priority_weights: weights,
    preferred_work_types: z.array(z.enum(["remote", "hybrid", "onsite"])).max(3),
    preferred_locations: z.array(z.string().trim().min(1).max(100)).max(20)
});
