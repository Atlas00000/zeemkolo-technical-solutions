import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../client/package.json"));
const { z } = require("zod");

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:5000"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required (set in client/.env.local)"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
});

function load(env) {
  return clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  });
}

const missing = load({
  NEXT_PUBLIC_API_URL: "http://localhost:5000",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
});
const present = load({
  NEXT_PUBLIC_API_URL: "http://localhost:5000",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_o0_smoke",
});

const failClosed =
  !missing.success &&
  missing.error.issues.some((i) =>
    i.path.includes("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  );
const passOpen = present.success === true;

console.log(
  `${failClosed ? "PASS" : "FAIL"}  env schema rejects empty Clerk key`,
);
console.log(
  `${passOpen ? "PASS" : "FAIL"}  env schema accepts valid public env`,
);

if (!failClosed || !passOpen) process.exit(1);
console.log("\nO0 env schema smoke passed");
