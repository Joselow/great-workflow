import type { Request, Response } from "express";

import { generateAccessToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { success } from "../utils/responses";

import { getUserByEmail, createUser } from "../services/user";

import { BadRequestError400 } from "../errors/BadRequestError400";
import { InvalidCredentialsError401 } from "../errors/InvalidCredentialsError401";

export async function register(req: Request, res: Response) {
  const { email, password, name, phone } = req.body ?? {};

   const existingUser = await getUserByEmail(email);
   if (existingUser) {
    throw new BadRequestError400('There is a user with this email address')
   }
 
   const hashedPassword = await hashPassword(password);
 
   const newUser = await createUser({
     name,
     email,
     password: hashedPassword,
     phone
   });
 
   const token = generateAccessToken({
     id: newUser.id,
     email: newUser.email,
     name: newUser.name,
   });
 
   const { password: _, ...userWithoutPassword } = newUser;

   success(res, 201,  {
    message: 'User successfully registered',
    user: userWithoutPassword,
    token
  })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  const user = await getUserByEmail(email);
  if (!user) {
    throw new InvalidCredentialsError401()
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new InvalidCredentialsError401()
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  const { password: _, ...userWithoutPassword } = user;

  success(res, 200, {
    success: true,
    message: 'Login successful',
    user: userWithoutPassword,
    token
  });
}