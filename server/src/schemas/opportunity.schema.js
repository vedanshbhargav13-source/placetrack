import { z } from "zod";

export const opportunitySchema = z.object({
    company: z.string().trim().min(1).max(100),
    role: z.string().trim().min(2).max(150),
    source: z.enum(["linkedin", "gmail", "college", "company_site", "referral", "other"]).default("other"),
    location: z.string().trim().max(150).nullable().optional(),
    work_type: z.enum(["remote", "hybrid", "onsite"]).nullable().optional(),
    apply_url: z.string().url().refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Must be an HTTP or HTTPS URL").nullable().optional(),
    deadline: z.iso.date().nullable().optional(),
    status: z.enum(["Saved", "Applied", "OA Scheduled", "Interview"]).default("Saved"),
    context: z.string().trim().max(3000).nullable().optional(),
    note: z.string().trim().max(5000).nullable().optional()
});
