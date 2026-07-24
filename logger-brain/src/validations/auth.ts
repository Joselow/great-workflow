import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string().min(7),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().min(6),
  });

type RegisterUser = z.infer<typeof RegisterSchema>;

  
export const verifyRegisterSchema = ({ email, name, password, phone }: RegisterUser) => {
    const resAuthType = RegisterSchema.safeParse({ email, name, password, phone })
    return resAuthType
}

export const LoginSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
  });

type LoginUser = z.infer<typeof LoginSchema>;
  
export const verifyLoginSchema = ({ email, password }: LoginUser) => {
    const resAuthType = LoginSchema.safeParse({ email, password })
    return resAuthType
}