import { z } from "zod";

const nameSchema = z.string().trim().min(1).max(255);

export const CreateRequirementSchema = z.object({
    name: nameSchema,
    projectId: z.uuidv7().optional(),
    meetingId: z.uuidv7().optional(),
});

export const verifyCreateRequirementSchema = (payload: unknown) => {
    return CreateRequirementSchema.safeParse(payload);
};

export const UpdateRequirementSchema = z.object({
    name: nameSchema,
});

export const verifyUpdateRequirementSchema = (payload: unknown) => {
    return UpdateRequirementSchema.safeParse(payload);
};

export const RequirementQuerySchema = z.object({
    projectId: z.uuidv7(),
    meetingId: z.uuidv7().optional(),
});

export const verifyRequirementQuerySchema = (payload: unknown) => {
    return RequirementQuerySchema.safeParse(payload);
};
