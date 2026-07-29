import { z } from "zod";

// Create
export const CreateLogSchema = z.object({
    meetingId: z.uuidv7().nullish(),
    typeMeetingLink : z.enum(["meet-log", "log-meet"]).nullish(),

    description : z.string().min(2),
    responsible: z.string().min(3).max(100),
    tags: z.string().min(2).max(255),

    comment: z.string().min(3).nullish(),
    completed: z.boolean().nullish(),
});

type CreateLog = z.infer<typeof CreateLogSchema>;

export const verifyCreateLogSchema = (payloadLog: CreateLog) => {
    const resAuthType = CreateLogSchema.safeParse(payloadLog)
    return resAuthType
}

// Update
export const UpdateLogSchema = CreateLogSchema.partial().refine(
    (data) => Object.values(data).some(value => value !== undefined),
    { message: "At least one field is required" }
);

type UpdateLog = z.infer<typeof UpdateLogSchema>;

export const verifyUpdateLogSchema = (payloadLog: UpdateLog) => {
    const resAuthType = UpdateLogSchema.safeParse(payloadLog)
    return resAuthType
}