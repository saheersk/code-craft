import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../db";
import { JWT } from "next-auth/jwt";

export interface session extends Session {
  user: {
    id: string;
    jwtToken: string;
    email: string;
    name: string;
    googleId: string;
  };
}
interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  googleId: string;
}

export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session }: { session: session }) {
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        if (!user.id) {
          console.error("Google ID is missing from the user object.");
          return token;
        }

        const existingUser = await db.user.findUnique({
          where: {
            googleId: user.id,
          },
        });

        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              googleId: user.id,
            },
          });
        }

        token.id = user?.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
};
