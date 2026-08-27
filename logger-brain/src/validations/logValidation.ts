import { z } from "zod";

const calendarDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .refine((value) => {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        );
    }, "Invalid calendar date");

export const LogQuerySchema = z
    .object({
        projectId: z.uuidv7().optional(),
        completed: z.enum(["true", "false"]).optional(),
        from: calendarDate.optional(),
        to: calendarDate.optional(),
    })
    .superRefine((data, ctx) => {
        const hasFrom = data.from !== undefined;
        const hasTo = data.to !== undefined;

        if (hasFrom !== hasTo) {
            ctx.addIssue({
                code: "custom",
                message: "from and to must be provided together",
                path: hasFrom ? ["to"] : ["from"],
            });
        }

        if (hasFrom && hasTo && data.from > data.to) {
            ctx.addIssue({
                code: "custom",
                message: "from must be less than or equal to to",
                path: ["from"],
            });
        }
    });

export type LogQuery = z.infer<typeof LogQuerySchema>;

export const verifyLogQuerySchema = (payload: unknown) => {
    return LogQuerySchema.safeParse(payload);
};

// Create
export const CreateLogSchema = z.object({
    projectId: z.uuidv7(),
    meetingId: z.uuidv7().nullish(),
    typeMeetingLink : z.enum(["meet-log", "log-meet"]).nullish(),

    description : z.string().min(2),
    responsible: z.string().min(3).max(100),
    tags: z.string().min(2).max(255),

    comment: z.string().nullish(),
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