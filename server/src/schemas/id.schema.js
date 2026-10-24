import { z } from "zod";

export const idSchema = z.coerce
    .number()
    .int("ID must be an integer")
    .positive("ID must be a positive number");