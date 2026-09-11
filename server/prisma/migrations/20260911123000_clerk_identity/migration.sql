-- Clerk identity: add clerk_user_id, drop password_hash (no row deletes)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_user_id" TEXT;

UPDATE "users"
SET "clerk_user_id" = 'user_seed_admin_zeemkolo'
WHERE "email" = 'admin@zeemkolo.com' AND ("clerk_user_id" IS NULL OR "clerk_user_id" = '');

UPDATE "users"
SET "clerk_user_id" = 'user_migrated_' || "id"
WHERE "clerk_user_id" IS NULL OR "clerk_user_id" = '';

ALTER TABLE "users" ALTER COLUMN "clerk_user_id" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_user_id_key" ON "users"("clerk_user_id");

ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
