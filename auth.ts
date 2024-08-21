import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// after validating credentials to create a new getUser function.

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User> `SELECT * FROM users WHERE email = ${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user');
    }
}

export const { auth, signIn, signOut} = NextAuth({
    ...authConfig,
    providers: [Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
            .object({email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);
            if(parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);
                if(!user) return null;
                // call bcrypt here
                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) return user;
            }
            console.log('Invalid credentials');
            return null
        }
    }),
    ],
    // should use Oauth from nextauth.js instead of Credentials for project
});

// needed spread syntax to get all required props
// Argument of type '{ authConfig: { pages: { signIn: string; }; callbacks: { authorized({ auth, request: { nextUrl } }: { request: NextRequest; auth: Session | null; }): boolean | Response; }; providers: never[]; }; }' is not assignable to parameter of type 'NextAuthConfig | ((request: NextRequest | undefined) => Awaitable<NextAuthConfig>)'.
// Object literal may only specify known properties, and 'authConfig' does not exist in type 'NextAuthConfig | ((request: NextRequest | undefined) => Awaitable<NextAuthConfig>