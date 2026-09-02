import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { randomUUID } from "node:crypto";
import { getUserByEmail, upsertUser } from "@/server/db";
import { verifyPassword } from "@/server/passwords";

const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

/**
 * Google is optional — registering it with empty credentials makes every
 * /api/auth/* call 500. Email + password always works, so the site is never
 * left without a way in.
 */
export const googleEnabled = Boolean(clientId && clientSecret);

const emailPassword = Credentials({
  id: "credentials",
  name: "Email",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(raw) {
    const email = typeof raw?.email === "string" ? raw.email.trim().toLowerCase() : "";
    const password = typeof raw?.password === "string" ? raw.password : "";
    if (!email || !password) return null;

    const user = await getUserByEmail(email);
    if (!user?.passwordHash) return null;

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return null;

    return { id: user.id, email: user.email, name: user.name ?? undefined };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: googleEnabled
    ? [Google({ clientId, clientSecret }), emailPassword]
    : [emailPassword],
  // Read explicitly rather than relying on ambient AUTH_SECRET pickup, which
  // silently fails with MissingSecret if the value lands after server start.
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/account" },
  callbacks: {
    // Mirror Google sign-ins into our own users table so both login routes
    // land on one row, keyed by email.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await upsertUser({
          id: user.id ?? randomUUID(),
          email: user.email,
          name: user.name ?? null,
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  trustHost: true,
});
