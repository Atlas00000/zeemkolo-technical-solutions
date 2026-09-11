import { prisma } from "../../config/db.js";

export class ForumError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "ForumError";
  }
}

function authorDto(author: { id: string; fullName: string; email: string }) {
  return {
    id: author.id,
    fullName: author.fullName,
    email: author.email,
  };
}

export async function listCategories() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    threadCount: c._count.threads,
  }));
}

export async function listThreads(input?: { categorySlug?: string }) {
  const threads = await prisma.forumThread.findMany({
    where: input?.categorySlug
      ? { category: { slug: input.categorySlug } }
      : undefined,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      category: { select: { id: true, slug: true, title: true } },
      _count: { select: { replies: true, votes: true } },
      votes: { select: { value: true } },
    },
  });

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    bodyPreview: t.body.length > 160 ? `${t.body.slice(0, 160).trimEnd()}…` : t.body,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    author: authorDto(t.author),
    category: t.category,
    replyCount: t._count.replies,
    score: t.votes.reduce((sum, v) => sum + v.value, 0),
  }));
}

type ReplyNode = {
  id: string;
  body: string;
  createdAt: string;
  author: ReturnType<typeof authorDto>;
  score: number;
  viewerVote: number | null;
  parentId: string | null;
  children: ReplyNode[];
};

export async function getThreadById(input: {
  threadId: string;
  viewerUserId?: string;
}) {
  const thread = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      category: { select: { id: true, slug: true, title: true } },
      votes: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          votes: true,
        },
      },
    },
  });

  if (!thread) {
    throw new ForumError("Thread not found", 404);
  }

  const replyNodes: ReplyNode[] = thread.replies.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    author: authorDto(r.author),
    score: r.votes.reduce((sum, v) => sum + v.value, 0),
    viewerVote: input.viewerUserId
      ? (r.votes.find((v) => v.userId === input.viewerUserId)?.value ?? null)
      : null,
    parentId: r.parentId,
    children: [],
  }));

  const byId = new Map(replyNodes.map((r) => [r.id, r]));
  const roots: ReplyNode[] = [];
  for (const node of replyNodes) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return {
    id: thread.id,
    title: thread.title,
    body: thread.body,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    author: authorDto(thread.author),
    category: thread.category,
    score: thread.votes.reduce((sum, v) => sum + v.value, 0),
    viewerVote: input.viewerUserId
      ? (thread.votes.find((v) => v.userId === input.viewerUserId)?.value ?? null)
      : null,
    replies: roots,
    replyCount: thread.replies.length,
  };
}

export async function createThread(input: {
  authorId: string;
  categorySlug: string;
  title: string;
  body: string;
}) {
  const category = await prisma.forumCategory.findUnique({
    where: { slug: input.categorySlug },
  });
  if (!category) {
    throw new ForumError("Category not found", 404);
  }

  const thread = await prisma.forumThread.create({
    data: {
      categoryId: category.id,
      authorId: input.authorId,
      title: input.title.trim(),
      body: input.body.trim(),
    },
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      category: { select: { id: true, slug: true, title: true } },
    },
  });

  return {
    id: thread.id,
    title: thread.title,
    body: thread.body,
    createdAt: thread.createdAt.toISOString(),
    author: authorDto(thread.author),
    category: thread.category,
  };
}

export async function createReply(input: {
  authorId: string;
  threadId: string;
  body: string;
  parentId?: string | null;
}) {
  const thread = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
  });
  if (!thread) {
    throw new ForumError("Thread not found", 404);
  }
  if (thread.isLocked) {
    throw new ForumError("Thread is locked", 403);
  }

  if (input.parentId) {
    const parent = await prisma.forumReply.findFirst({
      where: { id: input.parentId, threadId: input.threadId },
    });
    if (!parent) {
      throw new ForumError("Parent reply not found", 404);
    }
  }

  const reply = await prisma.forumReply.create({
    data: {
      threadId: input.threadId,
      authorId: input.authorId,
      body: input.body.trim(),
      parentId: input.parentId ?? null,
    },
    include: {
      author: { select: { id: true, fullName: true, email: true } },
    },
  });

  return {
    id: reply.id,
    threadId: reply.threadId,
    parentId: reply.parentId,
    body: reply.body,
    createdAt: reply.createdAt.toISOString(),
    author: authorDto(reply.author),
  };
}

export async function vote(input: {
  userId: string;
  threadId?: string;
  replyId?: string;
  value: 1 | -1;
}) {
  if (!input.threadId && !input.replyId) {
    throw new ForumError("threadId or replyId required", 400);
  }
  if (input.threadId && input.replyId) {
    throw new ForumError("Vote on thread or reply, not both", 400);
  }

  if (input.threadId) {
    const thread = await prisma.forumThread.findUnique({
      where: { id: input.threadId },
    });
    if (!thread) throw new ForumError("Thread not found", 404);

    const existing = await prisma.forumVote.findFirst({
      where: { userId: input.userId, threadId: input.threadId },
    });

    if (existing && existing.value === input.value) {
      await prisma.forumVote.delete({ where: { id: existing.id } });
      return { target: "thread" as const, id: input.threadId, value: 0 };
    }

    if (existing) {
      await prisma.forumVote.update({
        where: { id: existing.id },
        data: { value: input.value },
      });
    } else {
      await prisma.forumVote.create({
        data: {
          userId: input.userId,
          threadId: input.threadId,
          value: input.value,
        },
      });
    }

    return { target: "thread" as const, id: input.threadId, value: input.value };
  }

  const replyId = input.replyId!;
  const reply = await prisma.forumReply.findUnique({ where: { id: replyId } });
  if (!reply) throw new ForumError("Reply not found", 404);

  const existing = await prisma.forumVote.findFirst({
    where: { userId: input.userId, replyId },
  });

  if (existing && existing.value === input.value) {
    await prisma.forumVote.delete({ where: { id: existing.id } });
    return { target: "reply" as const, id: replyId, value: 0 };
  }

  if (existing) {
    await prisma.forumVote.update({
      where: { id: existing.id },
      data: { value: input.value },
    });
  } else {
    await prisma.forumVote.create({
      data: {
        userId: input.userId,
        replyId,
        value: input.value,
      },
    });
  }

  return { target: "reply" as const, id: replyId, value: input.value };
}
