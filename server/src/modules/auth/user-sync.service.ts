import type { User as ClerkUser } from "@clerk/backend";
import { Role, type User } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { assignMatricAtSignup } from "./matric.service.js";

function displayName(clerkUser: ClerkUser): string {
  const fromNames = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  if (fromNames) return fromNames;
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (email) return email.split("@")[0] ?? "User";
  return "User";
}

function primaryEmail(clerkUser: ClerkUser): string {
  const primary = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  );
  return (
    primary?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkUser.id}@users.clerk.local`
  );
}

async function withMatricIfNeeded(user: User): Promise<User> {
  if (user.role === Role.ADMIN) {
    return user;
  }

  const existing = await prisma.matric.findUnique({ where: { userId: user.id } });
  if (existing) {
    return user;
  }

  const result = await assignMatricAtSignup(user.id);
  return result.user;
}

export async function upsertUserFromClerk(clerkUser: ClerkUser): Promise<User> {
  const email = primaryEmail(clerkUser);
  const fullName = displayName(clerkUser);

  const existingByClerk = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });
  if (existingByClerk) {
    const updated = await prisma.user.update({
      where: { id: existingByClerk.id },
      data: { email, fullName },
    });
    return withMatricIfNeeded(updated);
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    const updated = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clerkUserId: clerkUser.id, fullName },
    });
    return withMatricIfNeeded(updated);
  }

  const created = await prisma.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email,
      fullName,
      role: Role.GENERAL_CUSTOMER,
    },
  });

  return withMatricIfNeeded(created);
}
