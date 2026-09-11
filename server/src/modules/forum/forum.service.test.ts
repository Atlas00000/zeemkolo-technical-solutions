import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../config/db.js";
import {
  createReply,
  createThread,
  getThreadById,
  listCategories,
  listThreads,
  vote,
} from "./forum.service.js";

describe("forum.service (Phase 4)", () => {
  let authorId: string;
  let threadId: string;
  let replyId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: "phase4-student@example.com" },
      update: { role: Role.ZEEMBLE_STUDENT },
      create: {
        email: "phase4-student@example.com",
        clerkUserId: "user_phase4_forum_student",
        fullName: "Phase 4 Student",
        role: Role.ZEEMBLE_STUDENT,
      },
    });
    authorId = user.id;

    await prisma.forumCategory.upsert({
      where: { slug: "general" },
      update: {},
      create: {
        slug: "general",
        title: "General Discussion",
        description: "Seed category",
        sortOrder: 1,
      },
    });
  });

  afterAll(async () => {
    if (threadId) {
      await prisma.forumVote.deleteMany({ where: { threadId } });
      await prisma.forumReply.deleteMany({ where: { threadId } });
      await prisma.forumThread.deleteMany({ where: { id: threadId } });
    }
    await prisma.user.deleteMany({ where: { email: "phase4-student@example.com" } });
    await prisma.$disconnect();
  });

  it("lists categories", async () => {
    const categories = await listCategories();
    expect(categories.some((c) => c.slug === "general")).toBe(true);
  });

  it("creates a thread and lists it", async () => {
    const thread = await createThread({
      authorId,
      categorySlug: "general",
      title: "Phase 4 test thread",
      body: "This is a seeded body for phase 4 forum service tests.",
    });
    threadId = thread.id;
    expect(thread.id).toBeTruthy();

    const threads = await listThreads({ categorySlug: "general" });
    expect(threads.some((t) => t.id === threadId)).toBe(true);
  });

  it("creates nested replies and returns a tree", async () => {
    const parent = await createReply({
      authorId,
      threadId,
      body: "Parent reply body",
    });
    replyId = parent.id;

    const child = await createReply({
      authorId,
      threadId,
      parentId: parent.id,
      body: "Nested child reply",
    });

    const detail = await getThreadById({ threadId });
    expect(detail.replyCount).toBe(2);
    expect(detail.replies[0]?.id).toBe(parent.id);
    expect(detail.replies[0]?.children[0]?.id).toBe(child.id);
  });

  it("toggles thread upvote", async () => {
    const first = await vote({ userId: authorId, threadId, value: 1 });
    expect(first.value).toBe(1);

    const again = await vote({ userId: authorId, threadId, value: 1 });
    expect(again.value).toBe(0);

    const replyVote = await vote({ userId: authorId, replyId, value: 1 });
    expect(replyVote.target).toBe("reply");
    expect(replyVote.value).toBe(1);
  });
});
