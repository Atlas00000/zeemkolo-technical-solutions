/**
 * Spot-check C4–C7 content after import + seed.
 *   node scripts/c47-verify.mjs
 */
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireFromServer = createRequire(resolve(root, "server", "package.json"));
const { PrismaClient } = requireFromServer("@prisma/client");

const prisma = new PrismaClient();

const lessons = await prisma.lesson.findMany({
  where: { module: { course: { slug: "smart-irrigation" } } },
  orderBy: { sortOrder: "asc" },
  select: {
    slug: true,
    sortOrder: true,
    markdownBody: true,
    schematicKey: true,
    videoUrl: true,
    isPreview: true,
    isPublished: true,
  },
});

let fail = 0;
for (const l of lessons) {
  const stub = l.markdownBody.includes("**C3**");
  const okMd = l.markdownBody.length > 500 && !stub;
  if (!okMd) fail++;
  console.log(
    JSON.stringify({
      n: l.sortOrder,
      slug: l.slug,
      md: l.markdownBody.length,
      stub,
      schematic: l.schematicKey,
      video: l.videoUrl,
      preview: l.isPreview,
      pub: l.isPublished,
      ok: okMd,
    }),
  );
}

const schematics = [
  "client/public/schematics/smart-irrigation/lesson-02-diagram.png",
  "client/public/schematics/smart-irrigation/lesson-03-diagram.png",
  "client/public/schematics/smart-irrigation/lesson-04-circuit-diagram.png",
];
for (const rel of schematics) {
  const ok = existsSync(resolve(root, rel));
  if (!ok) fail++;
  console.log(JSON.stringify({ file: rel, ok }));
}

const radar = await prisma.course.findUnique({
  where: { slug: "radar-alert" },
  include: { modules: { include: { lessons: true } } },
});
const radarLessons = radar?.modules.flatMap((m) => m.lessons) ?? [];
console.log(
  JSON.stringify({
    radar: radar?.slug,
    published: radar?.isPublished,
    lessons: radarLessons.map((l) => ({
      slug: l.slug,
      preview: l.isPreview,
      md: l.markdownBody.length,
    })),
  }),
);

const irr = await prisma.course.findUnique({
  where: { slug: "smart-irrigation" },
  select: { description: true },
});
console.log(
  JSON.stringify({
    irrDescLen: irr?.description?.length ?? 0,
    hasOverview: Boolean(irr?.description?.includes("Course overview")),
  }),
);

const withVideo = lessons.filter((l) => l.videoUrl?.startsWith("r2:"));
console.log(
  JSON.stringify({
    videoLessons: withVideo.length,
    expected: 3,
    ok: withVideo.length === 3 && fail === 0,
    fail,
  }),
);

await prisma.$disconnect();
process.exit(fail === 0 && withVideo.length === 3 ? 0 : 1);
