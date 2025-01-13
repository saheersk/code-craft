import NextAuth, { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from "../db";
import { JWT } from 'next-auth/jwt';

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
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, user }: { session: session; user: User }) {
      console.log(session, "=====session", user, "======user======");
      // if (session?.user) {
      //   session.user.id = user.id;
      //   session.user.email = user.email;
      //   session.user.name = user.name;
      //   session.user.googleId = user.googleId;
      // }
      
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User}) {
      if (user) {
      console.log(token,"======token======", user, "======token======");

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

