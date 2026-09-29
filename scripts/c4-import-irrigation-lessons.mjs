/**
 * C4 — import Smart Irrigation lesson bodies from R2 docx → Prisma markdown,
 * and promote diagrams into client/public/schematics/smart-irrigation/.
 *
 *   node scripts/c4-import-irrigation-lessons.mjs
 *   node scripts/c4-import-irrigation-lessons.mjs --dry-run
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const serverRoot = resolve(root, "server");
const dryRun = process.argv.includes("--dry-run");

const requireFromServer = createRequire(resolve(serverRoot, "package.json"));
const mammoth = requireFromServer("mammoth");
const { PrismaClient } = requireFromServer("@prisma/client");

const BUCKET = "zeemkolo-technical-solutions";
const COURSE_SLUG = "smart-irrigation";

const LESSONS = [
  {
    slug: "smart-agriculture-intelligent-irrigation",
    bodyKey: "lessons/smart-irrigation/lesson-01/body.docx",
    schematicPublic: null,
    schematicR2: null,
    videoR2: null,
    extras: ["lessons/smart-irrigation/beginner-guide.docx"],
  },
  {
    slug: "fundamental-principles-of-an-electric-circuit",
    bodyKey: "lessons/smart-irrigation/lesson-02/body.docx",
    schematicPublic: "/schematics/smart-irrigation/lesson-02-diagram.png",
    schematicR2: "lessons/smart-irrigation/lesson-02/diagram.png",
    videoR2: "lessons/smart-irrigation/lesson-02/screen-recording.mov",
    audioNote: "lessons/smart-irrigation/lesson-02/rgb-led.m4a",
  },
  {
    slug: "introduction-to-environmental-sensors",
    bodyKey: "lessons/smart-irrigation/lesson-03/body.docx",
    schematicPublic: "/schematics/smart-irrigation/lesson-03-diagram.png",
    schematicR2: "lessons/smart-irrigation/lesson-03/diagram.png",
    videoR2: "lessons/smart-irrigation/lesson-03/video.mov",
  },
  {
    slug: "build-your-first-smart-system",
    bodyKey: "lessons/smart-irrigation/lesson-04/body.docx",
    schematicPublic: "/schematics/smart-irrigation/lesson-04-circuit-diagram.png",
    schematicR2: "lessons/smart-irrigation/lesson-04/circuit-diagram.png",
    videoR2: "lessons/smart-irrigation/lesson-04/video.mov",
  },
  {
    slug: "signal-transmission",
    bodyKey: "lessons/smart-irrigation/lesson-05/body.docx",
    schematicPublic: null,
    schematicR2: null,
    videoR2: null,
  },
  {
    slug: "make-device-talk",
    bodyKey: "lessons/smart-irrigation/lesson-06/body.docx",
    schematicPublic: null,
    schematicR2: null,
    videoR2: null,
  },
  {
    slug: "manual-and-automatic-control",
    bodyKey: "lessons/smart-irrigation/lesson-07/body.docx",
    schematicPublic: null,
    schematicR2: null,
    videoR2: null,
  },
  {
    slug: "remote-control",
    bodyKey: "lessons/smart-irrigation/lesson-08/body.docx",
    schematicPublic: null,
    schematicR2: null,
    videoR2: null,
  },
];

function rclone(args) {
  const r = spawnSync("rclone", args, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  if (r.status !== 0) {
    throw new Error(
      `rclone failed (${r.status}): ${(r.stderr || r.stdout || "").trim()}`,
    );
  }
}

function downloadKey(key, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  rclone(["copyto", `r2:${BUCKET}/${key}`, dest]);
}

async function docxToMarkdown(localPath) {
  const result = await mammoth.convertToMarkdown({ path: localPath });
  let md = result.value.trim();
  // Soft-clean mammoth quirks
  md = md.replace(/\r\n/g, "\n");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md;
}

function withMediaNotes(md, lesson) {
  const notes = [];
  if (lesson.audioNote) {
    notes.push(
      `Lab audio (enrolled playback): \`${lesson.audioNote}\` — delivered via signed R2 when available.`,
    );
  }
  if (lesson.videoR2) {
    notes.push(
      `Lab video is attached below for enrolled students (private R2 object \`${lesson.videoR2}\`).`,
    );
  }
  if (!notes.length) return md;
  return `${md}\n\n---\n\n## Lab media\n\n${notes.map((n) => `- ${n}`).join("\n")}\n`;
}

async function main() {
  const tmp = join(root, ".tmp", "c4-irrigation");
  mkdirSync(tmp, { recursive: true });
  const publicSchematics = join(
    root,
    "client",
    "public",
    "schematics",
    "smart-irrigation",
  );
  mkdirSync(publicSchematics, { recursive: true });

  // Promote diagrams
  for (const lesson of LESSONS) {
    if (!lesson.schematicR2 || !lesson.schematicPublic) continue;
    const destName = lesson.schematicPublic.split("/").pop();
    const dest = join(publicSchematics, destName);
    console.log(`DIAGRAM ${lesson.schematicR2} → ${lesson.schematicPublic}`);
    if (!dryRun) downloadKey(lesson.schematicR2, dest);
  }

  // Assignment stills (lesson 2/3) — public extras for C4.2
  const assignmentCopies = [
    [
      "lessons/smart-irrigation/lesson-02/assignment/blue.png",
      "lesson-02-assignment-blue.png",
    ],
    [
      "lessons/smart-irrigation/lesson-02/assignment/green.png",
      "lesson-02-assignment-green.png",
    ],
    [
      "lessons/smart-irrigation/lesson-02/assignment/red.png",
      "lesson-02-assignment-red.png",
    ],
    [
      "lessons/smart-irrigation/lesson-03/assignment/scenario-1.png",
      "lesson-03-assignment-scenario-1.png",
    ],
  ];
  for (const [key, name] of assignmentCopies) {
    console.log(`ASSET ${key} → /schematics/smart-irrigation/${name}`);
    if (!dryRun) downloadKey(key, join(publicSchematics, name));
  }

  if (dryRun) {
    console.log("Dry-run: skipping Prisma updates");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const course = await prisma.course.findUnique({
      where: { slug: COURSE_SLUG },
      include: { modules: { include: { lessons: true } } },
    });
    if (!course) throw new Error(`Course ${COURSE_SLUG} not found — run seed first`);

    const module = course.modules.find(
      (m) => m.slug === "smart-irrigation-challenge",
    );
    if (!module) throw new Error("smart-irrigation-challenge module missing");

    // C4.3 — plain-language course overview (UI renders description as text, not markdown)
    const courseDescription =
      "This self-paced beginner course takes you from basic circuit principles to a working smart irrigation system. Across eight lessons you learn to read schematics, wire environmental sensors, drive pumps and valves with a microcontroller, send data over LoRa, and add remote monitoring and control — without assuming prior electronics experience. Follow along with the Zeemble Smart Irrigation Kit, or use equivalent parts from your own bench.";

    await prisma.course.update({
      where: { id: course.id },
      data: { description: courseDescription },
    });
    console.log("Updated course description (plain overview)");

    for (const lesson of LESSONS) {
      const local = join(tmp, `${lesson.slug}.docx`);
      downloadKey(lesson.bodyKey, local);
      let md = await docxToMarkdown(local);
      md = withMediaNotes(md, lesson);

      const row = module.lessons.find((l) => l.slug === lesson.slug);
      if (!row) {
        console.warn(`SKIP missing lesson ${lesson.slug}`);
        continue;
      }

      const videoUrl = lesson.videoR2 ? `r2:${lesson.videoR2}` : null;
      await prisma.lesson.update({
        where: { id: row.id },
        data: {
          markdownBody: md,
          schematicKey: lesson.schematicPublic,
          videoUrl,
        },
      });
      console.log(
        `LESSON ${lesson.slug} md=${md.length}c schematic=${lesson.schematicPublic ?? "-"} video=${videoUrl ?? "-"}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
