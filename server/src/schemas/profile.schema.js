import { z } from "zod";

const optionalUrl = z.string()
    .trim()
    .refine(
        value => value === "" || z.string().url().safeParse(value).success,
        "Must be a valid URL"
    )
    .nullable()
    .optional();

export const profileSchema = z.object({
    college: z.string().trim().max(150).nullable().optional(),

    branch: z.string().trim().max(100).nullable().optional(),

    graduation_year: z.number().int()
        .min(2020)
        .max(2100)
        .nullable()
        .optional(),

    cgpa: z.number()
        .min(0, "CGPA cannot be below 0")
        .max(10, "CGPA cannot exceed 10")
        .nullable()
        .optional(),

    skills: z.array(z.string().trim().min(1))
        .nullable()
        .optional(),

    github_url: optionalUrl,

    linkedin_url: optionalUrl
});