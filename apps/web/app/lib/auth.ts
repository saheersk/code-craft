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
    async session({ session, token }: { session: any; token: JWT }) {
      // console.log(session, "=========sessssion", token, "=======user")
      if (token) {
        session.user.id = token.id; // Add the `id` from the token to the session
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        if (!user.id) {
          console.error("Google ID is missing from the user object.");
          return token;
        }

        let userData: any = null;
        // console.log(user, "==================user=====jwt")
        userData = await db.user.findUnique({
          where: {
            googleId: user.id,
          },
        });

        console.log(userData, "==================existingUser=====jwt")
        if (!userData) {
          userData = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              googleId: user.id,
            },
          });
        }

        token.id = userData?.id;
        token.email = userData.email;
        token.name = userData.name;
      }
      return token;
    },
  },
};
