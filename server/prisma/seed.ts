import { PrismaClient, ProductType, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Admin bootstrap — link a real Clerk user id later via dashboard/seed update
  const admin = await prisma.user.upsert({
    where: { email: "admin@zeemkolo.com" },
    update: {},
    create: {
      email: "admin@zeemkolo.com",
      clerkUserId: "user_seed_admin_zeemkolo",
      fullName: "Zeemkolo Admin",
      role: Role.ADMIN,
    },
  });

  // 50 matric numbers: ZMB-2026-001 .. ZMB-2026-050
  const matricCodes = Array.from({ length: 50 }, (_, i) => {
    const n = String(i + 1).padStart(3, "0");
    return `ZMB-2026-${n}`;
  });

  for (const code of matricCodes) {
    await prisma.matric.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  // Sample LMS course with preview lesson
  const course = await prisma.course.upsert({
    where: { slug: "embedded-systems-foundations" },
    update: {},
    create: {
      slug: "embedded-systems-foundations",
      title: "Embedded Systems Foundations",
      description:
        "Core electronics, microcontroller basics, and firmware workflow for Zeemble students.",
      isPublished: true,
      sortOrder: 1,
      modules: {
        create: [
          {
            slug: "module-1-getting-started",
            title: "Module 1 — Getting Started",
            description: "Public preview module",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  slug: "welcome-to-zeemble",
                  title: "Welcome to Zeemble",
                  isPreview: true,
                  isPublished: true,
                  sortOrder: 1,
                  schematicKey: "/schematics/series-circuit.jpg",
                  markdownBody: `# Welcome to Zeemble

This preview lesson introduces the Zeemble Program.

## Goals
- Understand the course structure
- Set up your lab bench
- Know how your matric identifies you in the academy

## Ohm's law

$$V = IR$$

## Blink sketch

\`\`\`c
#include <stdint.h>

#define LED_PIN 13

void setup(void) {
  pinMode(LED_PIN, OUTPUT);
}

void loop(void) {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
\`\`\`

Use the schematic viewer below to pan and zoom the sample circuit.
`,
                },
                {
                  slug: "lab-safety-and-tools",
                  title: "Lab Safety and Tools",
                  isPreview: false,
                  isPublished: true,
                  sortOrder: 2,
                  markdownBody: `# Lab Safety and Tools

Full lesson content for verified Zeemble students only.

## Bench rules
1. Power off before rewiring
2. Use current-limited supplies when probing
3. Keep ESD strap connected on CMOS work

## Multimeter checklist
- Continuity before power
- Voltage range before probing rails
- Current mode only in series

\`\`\`bash
# Example serial monitor baud
pio device monitor -b 115200
\`\`\`
`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Keep lesson bodies fresh on re-seed (upsert create only runs once)
  const welcomeMarkdown = `# Welcome to Zeemble

This preview lesson introduces the Zeemble Program.

## Goals
- Understand the course structure
- Set up your lab bench
- Know how your matric identifies you in the academy

## Ohm's law

$$V = IR$$

## Blink sketch

\`\`\`c
#include <stdint.h>

#define LED_PIN 13

void setup(void) {
  pinMode(LED_PIN, OUTPUT);
}

void loop(void) {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
\`\`\`

Use the schematic viewer below to pan and zoom the sample circuit.
`;

  const labMarkdown = `# Lab Safety and Tools

Full lesson content for verified Zeemble students only.

## Bench rules
1. Power off before rewiring
2. Use current-limited supplies when probing
3. Keep ESD strap connected on CMOS work

## Multimeter checklist
- Continuity before power
- Voltage range before probing rails
- Current mode only in series

\`\`\`bash
# Example serial monitor baud
pio device monitor -b 115200
\`\`\`
`;

  await prisma.lesson.updateMany({
    where: { slug: "welcome-to-zeemble" },
    data: {
      isPreview: true,
      isPublished: true,
      schematicKey: "/schematics/series-circuit.jpg",
      markdownBody: welcomeMarkdown,
    },
  });

  await prisma.lesson.updateMany({
    where: { slug: "lab-safety-and-tools" },
    data: {
      isPreview: false,
      isPublished: true,
      markdownBody: labMarkdown,
    },
  });

  const generalCategory = await prisma.forumCategory.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      slug: "general",
      title: "General Discussion",
      description: "Questions and engineering talk for Zeemble students",
      sortOrder: 1,
    },
  });

  const existingSeedThread = await prisma.forumThread.findFirst({
    where: {
      categoryId: generalCategory.id,
      title: "Welcome to the Zeemble forum",
    },
  });

  if (!existingSeedThread) {
    await prisma.forumThread.create({
      data: {
        categoryId: generalCategory.id,
        authorId: admin.id,
        title: "Welcome to the Zeemble forum",
        body: `This board is for Zeemble students to discuss labs, firmware, and hardware questions.

Guests can read discussions. Students can start threads, reply, and upvote helpful posts.

Tip: include your MCU part number and what you already tried when asking for help.`,
        isPinned: true,
      },
    });
  }

  await prisma.product.upsert({
    where: { slug: "starter-lab-kit" },
    update: {},
    create: {
      slug: "starter-lab-kit",
      title: "Zeemble Starter Lab Kit",
      description: "Breadboard, jumper wires, LEDs, resistors, and USB programmer.",
      type: ProductType.PHYSICAL,
      priceNgn: 4500000, // ₦45,000.00 in kobo
      priceUsd: 3500, // $35.00 in cents
      stock: 25,
      isPublished: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "firmware-handbook" },
    update: {},
    create: {
      slug: "firmware-handbook",
      title: "Firmware Handbook (Ebook)",
      description: "Digital handbook covering C firmware patterns for MCUs.",
      type: ProductType.DIGITAL,
      priceNgn: 1500000,
      priceUsd: 1200,
      stock: 9999,
      digitalKey: "ebooks/firmware-handbook.pdf",
      isPublished: true,
    },
  });

  // C1 — Drive/R2 kits (imageKey = public web path; digitalKey = private R2 spec)
  await prisma.product.upsert({
    where: { slug: "radar-kit" },
    update: {
      title: "Zeemble Radar Kit",
      description:
        "Smart distance radar and alert hardware kit — sensors, MCU wiring, and lab materials for the Zeemble Radar & Alert track.",
      type: ProductType.PHYSICAL,
      priceNgn: 6500000,
      priceUsd: 5500,
      stock: 20,
      imageKey: "/store/radar-kit/image-1.png",
      digitalKey: "store/radar-kit/download/radar-kit-spec.docx",
      isPublished: true,
    },
    create: {
      slug: "radar-kit",
      title: "Zeemble Radar Kit",
      description:
        "Smart distance radar and alert hardware kit — sensors, MCU wiring, and lab materials for the Zeemble Radar & Alert track.",
      type: ProductType.PHYSICAL,
      priceNgn: 6500000,
      priceUsd: 5500,
      stock: 20,
      imageKey: "/store/radar-kit/image-1.png",
      digitalKey: "store/radar-kit/download/radar-kit-spec.docx",
      isPublished: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "smart-irrigation-kit" },
    update: {
      title: "Zeemble Smart Irrigation Kit",
      description:
        "Hands-on smart irrigation kit for soil moisture sensing, pumps/valves, and MCU control labs aligned with the Zeemble Smart Irrigation course.",
      type: ProductType.PHYSICAL,
      priceNgn: 8500000,
      priceUsd: 7500,
      stock: 15,
      imageKey: "/store/smart-irrigation-kit/image-1.png",
      digitalKey:
        "store/smart-irrigation-kit/download/smart-irrigation-kit-spec.docx",
      isPublished: true,
    },
    create: {
      slug: "smart-irrigation-kit",
      title: "Zeemble Smart Irrigation Kit",
      description:
        "Hands-on smart irrigation kit for soil moisture sensing, pumps/valves, and MCU control labs aligned with the Zeemble Smart Irrigation course.",
      type: ProductType.PHYSICAL,
      priceNgn: 8500000,
      priceUsd: 7500,
      stock: 15,
      imageKey: "/store/smart-irrigation-kit/image-1.png",
      digitalKey:
        "store/smart-irrigation-kit/download/smart-irrigation-kit-spec.docx",
      isPublished: true,
    },
  });

  // C3 — ZEEMBLE Smart Irrigation Challenge (skeleton; bodies filled in C4)
  const irrigationStub = (lessonNo: number, title: string, sourceKey: string) =>
    `# ${title}

> Skeleton lesson for content population **C3**. Full markdown lands in **C4** from \`${sourceKey}\`.

## Status
- Course: Smart Irrigation Challenge (8 lessons)
- Source body (R2): \`${sourceKey}\`

Content conversion pending.
`;

  const irrigationLessons = [
    {
      slug: "smart-agriculture-intelligent-irrigation",
      title: "Lesson 1 — Smart Agriculture & Intelligent Irrigation",
      sortOrder: 1,
      isPreview: true,
      sourceKey: "lessons/smart-irrigation/lesson-01/body.docx",
      schematicKey: null as string | null,
    },
    {
      slug: "fundamental-principles-of-an-electric-circuit",
      title: "Lesson 2 — Fundamental Principles of an Electric Circuit",
      sortOrder: 2,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-02/body.docx",
      schematicKey: null,
    },
    {
      slug: "introduction-to-environmental-sensors",
      title: "Lesson 3 — Introduction to Environmental Sensors",
      sortOrder: 3,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-03/body.docx",
      schematicKey: null,
    },
    {
      slug: "build-your-first-smart-system",
      title: "Lesson 4 — Build Your First Smart System",
      sortOrder: 4,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-04/body.docx",
      schematicKey: null,
    },
    {
      slug: "signal-transmission",
      title: "Lesson 5 — Signal Transmission",
      sortOrder: 5,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-05/body.docx",
      schematicKey: null,
    },
    {
      slug: "make-device-talk",
      title: "Lesson 6 — Make Device Talk",
      sortOrder: 6,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-06/body.docx",
      schematicKey: null,
    },
    {
      slug: "manual-and-automatic-control",
      title: "Lesson 7 — Manual and Automatic Control",
      sortOrder: 7,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-07/body.docx",
      schematicKey: null,
    },
    {
      slug: "remote-control",
      title: "Lesson 8 — Remote Control",
      sortOrder: 8,
      isPreview: false,
      sourceKey: "lessons/smart-irrigation/lesson-08/body.docx",
      schematicKey: null,
    },
  ] as const;

  const irrigationOverview =
    "This self-paced beginner course takes you from basic circuit principles to a working smart irrigation system. Across eight lessons you learn to read schematics, wire environmental sensors, drive pumps and valves with a microcontroller, send data over LoRa, and add remote monitoring and control — without assuming prior electronics experience. Follow along with the Zeemble Smart Irrigation Kit, or use equivalent parts from your own bench.";

  const irrigationCourse = await prisma.course.upsert({
    where: { slug: "smart-irrigation" },
    update: {
      title: "ZEEMBLE Smart Irrigation Challenge",
      description: irrigationOverview,
      isPublished: true,
      sortOrder: 2,
    },
    create: {
      slug: "smart-irrigation",
      title: "ZEEMBLE Smart Irrigation Challenge",
      description: irrigationOverview,
      isPublished: true,
      sortOrder: 2,
    },
  });

  const irrigationModule = await prisma.module.upsert({
    where: {
      courseId_slug: {
        courseId: irrigationCourse.id,
        slug: "smart-irrigation-challenge",
      },
    },
    update: {
      title: "Smart Irrigation Challenge",
      description:
        "Eight lessons from farm problem framing through remote cloud control. Source pack: courses/smart-irrigation/summary.docx",
      sortOrder: 1,
    },
    create: {
      courseId: irrigationCourse.id,
      slug: "smart-irrigation-challenge",
      title: "Smart Irrigation Challenge",
      description:
        "Eight lessons from farm problem framing through remote cloud control. Source pack: courses/smart-irrigation/summary.docx",
      sortOrder: 1,
    },
  });

  for (const lesson of irrigationLessons) {
    await prisma.lesson.upsert({
      where: {
        moduleId_slug: {
          moduleId: irrigationModule.id,
          slug: lesson.slug,
        },
      },
      update: {
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        isPreview: lesson.isPreview,
        isPublished: true,
        // C7.3 — do not clobber C4 markdown / schematic / video on re-seed
      },
      create: {
        moduleId: irrigationModule.id,
        slug: lesson.slug,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        isPreview: lesson.isPreview,
        isPublished: true,
        schematicKey: lesson.schematicKey,
        markdownBody: irrigationStub(
          lesson.sortOrder,
          lesson.title,
          lesson.sourceKey,
        ),
      },
    });
  }

  // Ensure stubs exist for lessons still on placeholder (first seed / empty body)
  for (const lesson of irrigationLessons) {
    const row = await prisma.lesson.findUnique({
      where: {
        moduleId_slug: {
          moduleId: irrigationModule.id,
          slug: lesson.slug,
        },
      },
    });
    if (row && row.markdownBody.includes("**C3**")) {
      await prisma.lesson.update({
        where: { id: row.id },
        data: {
          title: lesson.title,
          sortOrder: lesson.sortOrder,
          isPreview: lesson.isPreview,
          isPublished: true,
          markdownBody: irrigationStub(
            lesson.sortOrder,
            lesson.title,
            lesson.sourceKey,
          ),
        },
      });
    }
  }

  // C6 — Radar & Alert course (summary only; lesson pack not in Drive import)
  const radarCourse = await prisma.course.upsert({
    where: { slug: "radar-alert" },
    update: {
      title: "Zeemble Smart Distance Radar & Alert System",
      description:
        "Coming soon — course overview from the author pack. Pair with the Zeemble Radar Kit in the store while the full lesson pack is prepared.\n\nStore: [/store/radar-kit](/store/radar-kit)",
      isPublished: true,
      sortOrder: 3,
    },
    create: {
      slug: "radar-alert",
      title: "Zeemble Smart Distance Radar & Alert System",
      description:
        "Coming soon — course overview from the author pack. Pair with the Zeemble Radar Kit in the store while the full lesson pack is prepared.\n\nStore: [/store/radar-kit](/store/radar-kit)",
      isPublished: true,
      sortOrder: 3,
    },
  });

  const radarModule = await prisma.module.upsert({
    where: {
      courseId_slug: {
        courseId: radarCourse.id,
        slug: "overview",
      },
    },
    update: {
      title: "Overview",
      description:
        "Source: courses/radar-alert/summary.docx. Full modules land when the lesson pack is imported.",
      sortOrder: 1,
    },
    create: {
      courseId: radarCourse.id,
      slug: "overview",
      title: "Overview",
      description:
        "Source: courses/radar-alert/summary.docx. Full modules land when the lesson pack is imported.",
      sortOrder: 1,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: radarModule.id,
        slug: "course-overview",
      },
    },
    update: {
      title: "Course overview & kit pairing",
      isPreview: true,
      isPublished: true,
      sortOrder: 1,
    },
    create: {
      moduleId: radarModule.id,
      slug: "course-overview",
      title: "Course overview & kit pairing",
      isPreview: true,
      isPublished: true,
      sortOrder: 1,
      markdownBody: `# Smart Distance Radar & Alert System

This course is **scaffolded** from the author summary (\`courses/radar-alert/summary.docx\`). Detailed lab lessons are not in the current Drive import — status: **coming soon**.

## What you can do now

1. Read this overview (public preview).
2. Order the hardware companion: **[Zeemble Radar Kit](/store/radar-kit)**.
3. Continue with the published **[Smart Irrigation Challenge](/zeemble/courses/smart-irrigation)** while Radar labs are authored.

## Honest publish state

- Course: published (discoverable)
- Labs: pending content pack (C6.2)
`,
    },
  });

  // C6.3 — keep radar kit description pointing at the course
  await prisma.product.updateMany({
    where: { slug: "radar-kit" },
    data: {
      description:
        "Smart distance radar and alert hardware kit — sensors, MCU wiring, and lab materials for the Zeemble Radar & Alert track. Course overview: /zeemble/courses/radar-alert",
    },
  });

  console.log("Seed complete:", {
    admin: admin.email,
    matrics: matricCodes.length,
    course: course.slug,
    irrigation: irrigationCourse.slug,
    irrigationLessons: irrigationLessons.length,
    radar: radarCourse.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
