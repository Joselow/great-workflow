import { z } from "zod";

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const CreateProjectSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().nullish(),
    color: colorSchema.optional(),
});

type CreateProject = z.infer<typeof CreateProjectSchema>;

export const verifyCreateProjectSchema = (payload: CreateProject) => {
    return CreateProjectSchema.safeParse(payload);
};

export const UpdateProjectSchema = CreateProjectSchema.partial().refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field is required" }
);

type UpdateProject = z.infer<typeof UpdateProjectSchema>;

export const verifyUpdateProjectSchema = (payload: UpdateProject) => {
    return UpdateProjectSchema.safeParse(payload);
};
