import { z } from 'zod';

export const setupSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    batchName: z.string().min(2, "Batch name is required (e.g. MCA 2024-2026)"),
    startYear: z.number().int().min(2020).max(2100),
    endYear: z.number().int().min(2020).max(2100),
}).refine(data => data.endYear > data.startYear, {
    message: "End year must be after start year",
    path: ["endYear"]
});

export type SetupInput = z.infer<typeof setupSchema>;
