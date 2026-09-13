import { z } from "zod";

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const cardSectionSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
});

export const CreateCardSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    color: colorSchema.optional(),
    isPrompt: z.boolean().optional(),
    flMeeting: z.boolean().optional(),
    projectId: z.uuidv7().nullable().optional(),
    sections: z.array(cardSectionSchema).optional(),
});

type CreateCard = z.infer<typeof CreateCardSchema>;

export const verifyCreateCardSchema = (payload: CreateCard) => {
    return CreateCardSchema.safeParse(payload);
};

export const UpdateCardSchema = CreateCardSchema.partial().refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field is required" }
);

type UpdateCard = z.infer<typeof UpdateCardSchema>;

export const verifyUpdateCardSchema = (payload: UpdateCard) => {
    return UpdateCardSchema.safeParse(payload);
};

const booleanQuery = z.enum(["true", "false"]);

const optionalPage = z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).optional(),
);

const optionalLimit = z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(24).optional(),
);

export const CardListQuerySchema = z.object({
    q: z.string().max(200).optional(),
    projectId: z.union([z.uuidv7(), z.literal("null")]).optional(),
    isPrompt: booleanQuery.optional(),
    flMeeting: booleanQuery.optional(),
    page: optionalPage,
    limit: optionalLimit,
});

export const verifyCardListQuerySchema = (payload: unknown) => {
    return CardListQuerySchema.safeParse(payload);
};
