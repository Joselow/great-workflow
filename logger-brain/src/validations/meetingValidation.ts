import { z } from "zod";

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

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

const issueSchema = z.object({
    id: z.number().int().optional(),
    name: z.string(),
    color: colorSchema.optional(),
});

const logLinkSchema = z.object({
    logId: z.uuidv7(),
    source: z.enum(["log", "meeting"]),
});

const nextStepSchema = z.object({
    logId: z.uuidv7().optional(),
    description: z.string(),
});

const MEETING_PLATFORMS = ["meet", "zoom", "teams", "whatsapp", "presencial", "otro"] as const;

const blankToNull = (value: unknown) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

const nullableText = z.preprocess(blankToNull, z.string().nullable().optional());

const meetingBody = {
    title: z.string().min(1).max(100),
    date: z.string().min(1),
    estimatedDuration: z.number().int().min(1),
    topicStatus: z.string().optional(),
    objective: z.string().max(255).optional(),
    participants: z.string().optional(),
    color: colorSchema.optional(),
    projectId: z.uuidv7().nullable().optional(),
    issues: z.array(issueSchema).optional(),
    cardIds: z.array(z.uuidv7()).optional(),
    logLinks: z.array(logLinkSchema).optional(),
    nextSteps: z.array(nextStepSchema).optional(),
    summary: z.string().nullable().optional(),
    lessons: z.string().nullable().optional(),
    executed: z.boolean().optional(),
    objectiveAchieved: z.boolean().nullable().optional(),
    additionalInfo: nullableText,
    platform: z.preprocess(blankToNull, z.enum(MEETING_PLATFORMS).nullable().optional()),
    meetingUrl: nullableText,
    accessDetails: nullableText,
};

const requireLessonsWhenNotAchieved = (
    data: { objectiveAchieved?: boolean | null; lessons?: string | null },
    ctx: z.RefinementCtx,
) => {
    if (data.objectiveAchieved !== false) return;
    if (data.lessons?.trim()) return;

    ctx.addIssue({
        code: "custom",
        message: "Lessons are required when the objective was not achieved",
        path: ["lessons"],
    });
};

export const CreateMeetingSchema = z.object(meetingBody).superRefine(requireLessonsWhenNotAchieved);

export const verifyCreateMeetingSchema = (payload: unknown) => {
    return CreateMeetingSchema.safeParse(payload);
};

export const UpdateMeetingSchema = z.object(meetingBody).partial()
    .superRefine(requireLessonsWhenNotAchieved)
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one field is required" }
    );

export const verifyUpdateMeetingSchema = (payload: unknown) => {
    return UpdateMeetingSchema.safeParse(payload);
};

const optionalPage = z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).optional(),
);

const optionalLimit = z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(24).optional(),
);

export const MeetingListQuerySchema = z
    .object({
        projectId: z.union([z.uuidv7(), z.literal("null")]).optional(),
        from: calendarDate.optional(),
        to: calendarDate.optional(),
        page: optionalPage,
        limit: optionalLimit,
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

        if (hasFrom && hasTo && data.from && data.to && data.from > data.to) {
            ctx.addIssue({
                code: "custom",
                message: "from must be less than or equal to to",
                path: ["from"],
            });
        }
    });

export const verifyMeetingListQuerySchema = (payload: unknown) => {
    return MeetingListQuerySchema.safeParse(payload);
};

