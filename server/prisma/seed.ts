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

  console.log("Seed complete:", {
    admin: admin.email,
    matrics: matricCodes.length,
    course: course.slug,
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
