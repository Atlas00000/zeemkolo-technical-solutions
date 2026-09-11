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
                  sortOrder: 1,
                  markdownBody: `# Welcome to Zeemble

This preview lesson introduces the Zeemble Program.

## Goals
- Understand the course structure
- Set up your lab bench
- Claim your matric number at registration

$$V = IR$$
`,
                },
                {
                  slug: "lab-safety-and-tools",
                  title: "Lab Safety and Tools",
                  isPreview: false,
                  sortOrder: 2,
                  markdownBody: `# Lab Safety and Tools

Full lesson content for verified Zeemble students only.
`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.forumCategory.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      slug: "general",
      title: "General Discussion",
      description: "Questions and engineering talk for Zeemble students",
      sortOrder: 1,
    },
  });

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
