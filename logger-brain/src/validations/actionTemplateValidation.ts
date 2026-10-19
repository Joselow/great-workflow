import { z } from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const actionTemplateModuleSchema = z.enum([
    'all',
    'log',
    'meeting',
    'requirement',
    'task',
]);

const nameSchema = z.string().trim().min(1).max(255);

const actionSchema = z
    .union([z.string().trim().max(1000), z.null()])
    .optional()
    .transform((value) => {
        if (value == null || value === '') return null;
        return value;
    });

const templateSchema = z.string().trim().max(20000).optional();

export const ActionTemplateWriteSchema = z.object({
    module: actionTemplateModuleSchema,
    name: nameSchema,
    action: actionSchema,
    template: templateSchema,
    color: colorSchema,
    isActive: z.boolean().optional(),
    cardId: z.uuidv7().nullable().optional(),
}).superRefine((data, ctx) => {
    const linked = data.cardId != null;
    if (!linked && !data.template) {
        ctx.addIssue({
            code: 'custom',
            path: ['template'],
            message: 'Template is required',
        });
    }
});

export const verifyActionTemplateWriteSchema = (payload: unknown) => {
    return ActionTemplateWriteSchema.safeParse(payload);
};

const emptyToUndefined = (value: unknown) =>
    value === '' || value === undefined ? undefined : value;

export const ActionTemplateQuerySchema = z.object({
    module: z.preprocess(emptyToUndefined, actionTemplateModuleSchema.optional()),
});

export const verifyActionTemplateQuerySchema = (payload: unknown) => {
    return ActionTemplateQuerySchema.safeParse(payload);
};

export const ActionTemplateIdSchema = z.string().regex(/^[1-9]\d*$/);

export const verifyActionTemplateId = (id: string) => {
    return ActionTemplateIdSchema.safeParse(id);
};
