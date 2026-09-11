/**
 * Promote an existing Postgres user (synced from Clerk) to ADMIN.
 *
 * Usage:
 *   pnpm --filter @zeemkolo/server exec tsx scripts/promote-admin.ts --email=you@example.com
 *   pnpm --filter @zeemkolo/server exec tsx scripts/promote-admin.ts --clerkUserId=user_xxx
 *
 * The user must have signed in at least once so Clerk → Postgres sync has run.
 */
import { Role } from "@prisma/client";
import { prisma } from "../src/config/db.js";
import { promoteUserToAdmin } from "../src/modules/admin/admin.service.js";

function argValue(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith("-")) {
    return process.argv[idx + 1];
  }
  return undefined;
}

async function main() {
  const email = argValue("--email");
  const clerkUserId = argValue("--clerkUserId");

  if (!email && !clerkUserId) {
    console.error(
      "Usage: tsx scripts/promote-admin.ts --email=you@example.com\n" +
        "   or: tsx scripts/promote-admin.ts --clerkUserId=user_xxx",
    );
    process.exit(1);
  }

  const result = await promoteUserToAdmin({ email, clerkUserId });
  console.log("Promoted to ADMIN:");
  console.log(JSON.stringify(result, null, 2));

  if (result.role !== Role.ADMIN) {
    process.exit(2);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
