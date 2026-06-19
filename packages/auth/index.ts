import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Apple from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@aether/database";
import { Role } from "./src/rbac";

export * from "./src/rbac";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
});

/**
 * Helper to check if a user is a member of an organization with a specific role
 */
export async function checkMembership(userId: string, organizationId: string) {
  const membership = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
  return membership;
}

/**
 * Helper to check if a user has a specific permission in an organization
 */
export async function hasOrgPermission(
  userId: string,
  organizationId: string,
  permission: string
) {
  const membership = await checkMembership(userId, organizationId);
  if (!membership) return false;

  // Since we don't have a direct import of hasPermission here to avoid circularity if any, 
  // but it's exported from the same package.
  const { hasPermission, RolePermissions } = await import("./src/rbac");
  return hasPermission(membership.role as Role, permission as any);
}
