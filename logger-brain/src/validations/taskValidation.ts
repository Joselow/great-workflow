import { z } from "zod";

const nameSchema = z.string().trim().min(1).max(255);

export const CreateTaskSchema = z.object({
    name: nameSchema,
    description: z.string().optional().default(""),
    completed: z.boolean().optional().default(false),
    projectId: z.uuidv7().optional(),
    meetingId: z.uuidv7().optional(),
    requirementId: z.uuidv7().optional(),
});

export const verifyCreateTaskSchema = (payload: unknown) => {
    return CreateTaskSchema.safeParse(payload);
};

export const UpdateTaskSchema = z.object({
    name: nameSchema.optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    requirementId: z.uuidv7().nullable().optional(),
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field is required" },
);

export const verifyUpdateTaskSchema = (payload: unknown) => {
    return UpdateTaskSchema.safeParse(payload);
};

export const PatchTaskSchema = z.strictObject({
    completed: z.boolean(),
});

export const verifyPatchTaskSchema = (payload: unknown) => {
    return PatchTaskSchema.safeParse(payload);
};

export const TaskQuerySchema = z.object({
    projectId: z.uuidv7(),
    meetingId: z.uuidv7().optional(),
    requirementId: z.union([z.uuidv7(), z.literal("null")]).optional(),
    completed: z.enum(["true", "false"]).optional(),
});

export const verifyTaskQuerySchema = (payload: unknown) => {
    return TaskQuerySchema.safeParse(payload);
};
