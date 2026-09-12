-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false;

-- Existing seeded lessons become visible to students
UPDATE "lessons" SET "is_published" = true;
