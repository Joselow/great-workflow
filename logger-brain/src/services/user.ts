import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, type User, NewUser } from '../db/schemas/users.js';


// Obtener un usuario por ID
export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

// Obtener un usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function createUser(newUser: NewUser) {
  const [user] = await db.insert(users).values(newUser).returning();
  return user
}