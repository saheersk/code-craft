import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../db";
import { JWT } from "next-auth/jwt";


interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
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
        session.user.id = token.id as string; // Explicitly cast if necessary
        session.user.email = token.email as string;
        session.user.name = token.name as string;
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
  // pages: {
  //   signIn: '/auth/signin',
  // },
};
