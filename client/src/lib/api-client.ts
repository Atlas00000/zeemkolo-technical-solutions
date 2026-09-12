const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type AppUser = {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  role: "PUBLIC_VISITOR" | "GENERAL_CUSTOMER" | "ZEEMBLE_STUDENT" | "ADMIN";
  matric: { code: string; claimedAt: string | null } | null;
};

export type ConsultationSlot = {
  startsAt: string;
  timezone: string;
  durationMinutes: number;
};

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string; revalidate?: number | false } = {},
): Promise<T> {
  const { token, headers, revalidate, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const isPublicGet = method === "GET" && !token;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(isPublicGet
      ? {
          next: {
            revalidate: revalidate === false ? 0 : (revalidate ?? 60),
          },
        }
      : { cache: "no-store" as const }),
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string | { formErrors?: string[] };
    error?: string;
  };

  if (!response.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : data.error ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function fetchMe(token: string) {
  return apiFetch<AppUser>("/auth/me", { token });
}

export function claimMatric(token: string, code: string) {
  return apiFetch<{
    role: AppUser["role"];
    matric: { code: string; claimedAt: string | null };
  }>("/auth/matric/claim", {
    method: "POST",
    token,
    body: JSON.stringify({ code }),
  });
}

export function fetchConsultationSlots(days = 14) {
  return apiFetch<{ timezone: string; slots: ConsultationSlot[] }>(
    `/consultations/slots?days=${days}`,
  );
}

export function fetchConsultationServices() {
  return apiFetch<{ services: string[] }>("/consultations/services");
}

export function uploadConsultationAttachment(
  input: { filename: string; contentBase64: string },
  token?: string,
) {
  return apiFetch<{ attachmentKey: string }>("/consultations/upload", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function bookConsultation(
  input: {
    guestName: string;
    guestEmail: string;
    serviceType: string;
    projectBrief: string;
    slotStartsAt: string;
    timezone: string;
    attachmentKey?: string;
  },
  token?: string,
) {
  return apiFetch<{
    id: string;
    status: string;
    serviceType: string;
    slotStartsAt: string;
    timezone: string;
    email: { sent: boolean; skippedReason?: string };
  }>("/consultations", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export type LmsLessonSummary = {
  id: string;
  slug: string;
  title: string;
  isPreview: boolean;
  sortOrder: number;
};

export type LmsModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  lessons: LmsLessonSummary[];
};

export type LmsCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  modules: LmsModule[];
};

export type LmsLesson = {
  id: string;
  slug: string;
  title: string;
  isPreview: boolean;
  gated: boolean;
  markdownBody: string;
  videoUrl: string | null;
  schematicKey: string | null;
  codeBundleKey: string | null;
  course: { id: string; slug: string; title: string };
  module: {
    id: string;
    slug: string;
    title: string;
    lessons: LmsLessonSummary[];
  };
};

export type LmsCourseProgress = {
  courseSlug: string;
  totalLessons: number;
  completedCount: number;
  percentComplete: number;
  resumePoint: {
    lessonSlug: string;
    moduleSlug: string;
    href: string;
  } | null;
  lessons: { id: string; slug: string; title: string; completed: boolean }[];
};

export function fetchLmsCourses() {
  return apiFetch<{ courses: LmsCourse[] }>("/lms/courses");
}

export function fetchLmsCourse(courseSlug: string) {
  return apiFetch<LmsCourse>(`/lms/courses/${courseSlug}`);
}

export function fetchLmsLesson(
  courseSlug: string,
  lessonSlug: string,
  token?: string,
) {
  return apiFetch<LmsLesson>(
    `/lms/courses/${courseSlug}/lessons/${lessonSlug}`,
    { token },
  );
}

export function fetchLmsCourseProgress(courseSlug: string, token: string) {
  return apiFetch<LmsCourseProgress>(`/lms/courses/${courseSlug}/progress`, {
    token,
  });
}

export function upsertLmsProgress(
  input: { lessonId: string; completed: boolean },
  token: string,
) {
  return apiFetch<{
    lessonId: string;
    completed: boolean;
    completedAt: string | null;
  }>("/lms/progress", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export type ForumAuthor = {
  id: string;
  fullName: string;
  email: string;
};

export type ForumCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  threadCount: number;
};

export type ForumThreadSummary = {
  id: string;
  title: string;
  bodyPreview: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
  category: { id: string; slug: string; title: string };
  replyCount: number;
  score: number;
};

export type ForumReplyNode = {
  id: string;
  body: string;
  createdAt: string;
  author: ForumAuthor;
  score: number;
  viewerVote: number | null;
  parentId: string | null;
  children: ForumReplyNode[];
};

export type ForumThreadDetail = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
  category: { id: string; slug: string; title: string };
  score: number;
  viewerVote: number | null;
  replies: ForumReplyNode[];
  replyCount: number;
};

export function fetchForumCategories() {
  return apiFetch<{ categories: ForumCategory[] }>("/forum/categories");
}

export function fetchForumThreads(category?: string) {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<{ threads: ForumThreadSummary[] }>(`/forum/threads${q}`);
}

export function fetchForumThread(threadId: string, token?: string) {
  return apiFetch<ForumThreadDetail>(`/forum/threads/${threadId}`, { token });
}

export function createForumThread(
  input: { categorySlug: string; title: string; body: string },
  token: string,
) {
  return apiFetch<{ id: string }>("/forum/threads", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function createForumReply(
  threadId: string,
  input: { body: string; parentId?: string | null },
  token: string,
) {
  return apiFetch<{ id: string }>(`/forum/threads/${threadId}/replies`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function castForumVote(
  input: { threadId?: string; replyId?: string; value: 1 | -1 },
  token: string,
) {
  return apiFetch<{ target: string; id: string; value: number }>("/forum/votes", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export type Money = {
  amountMinor: number;
  currency: "NGN" | "USD";
  formatted: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: "PHYSICAL" | "DIGITAL";
  stock: number;
  imageKey: string | null;
  hasDigitalAsset: boolean;
  priceNgn: Money;
  priceUsd: Money;
  price: Money;
};

export type StoreOrder = {
  id: string;
  email: string;
  status: string;
  currency: "NGN" | "USD";
  total: Money;
  paymentProvider: string | null;
  paymentRef: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: Money;
    product: {
      id: string;
      slug: string;
      title: string;
      type: "PHYSICAL" | "DIGITAL";
      downloadable: boolean;
    };
  }[];
  downloadsAvailable: { productId: string; slug: string; title: string }[];
  checkout?: { message: string; paymentRef: string | null };
};

export function fetchStoreProducts(currency: "NGN" | "USD" = "NGN") {
  return apiFetch<{ products: StoreProduct[]; currency: string }>(
    `/store/products?currency=${currency}`,
  );
}

export function fetchStoreProduct(
  slug: string,
  currency: "NGN" | "USD" = "NGN",
) {
  return apiFetch<StoreProduct>(
    `/store/products/${encodeURIComponent(slug)}?currency=${currency}`,
  );
}

export function createStoreOrder(
  input: {
    email: string;
    currency: "NGN" | "USD";
    paymentProvider: "paystack" | "stripe";
    items: { productId: string; quantity: number }[];
  },
  token?: string,
) {
  return apiFetch<StoreOrder>("/store/orders", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function fetchStoreOrder(orderId: string) {
  return apiFetch<StoreOrder>(`/store/orders/${orderId}`);
}

export function confirmStoreOrderTest(orderId: string) {
  return apiFetch<StoreOrder>(`/store/orders/${orderId}/confirm-test`, {
    method: "POST",
  });
}

export function requestStoreDownload(
  orderId: string,
  productId: string,
  email?: string,
  token?: string,
) {
  const q = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<{
    productId: string;
    title: string;
    url: string;
    expiresInSeconds: number;
    provider: string;
  }>(`/store/orders/${orderId}/downloads/${productId}${q}`, { token });
}

export function adminGetOverview(token: string) {
  return apiFetch<{
    overview: {
      users: number;
      openConsultations: number;
      pendingOrders: number;
      unclaimedMatrics: number;
      claimedMatrics: number;
      lockedThreads: number;
    };
  }>("/admin/overview", { token });
}

export function adminListAudit(token: string, limit = 50) {
  return apiFetch<{
    events: {
      id: string;
      action: string;
      targetType: string;
      targetId: string | null;
      metadata: unknown;
      createdAt: string;
      actor: { id: string; email: string; fullName: string };
    }[];
  }>(`/admin/audit?limit=${limit}`, { token });
}

export function adminBatchMatrics(
  input: { count: number; year?: number },
  token: string,
) {
  return apiFetch<{
    year: number;
    count: number;
    codes: string[];
    csv: string;
  }>("/admin/matrics/batch", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function adminListMatrics(
  token: string,
  opts?: { filter?: "all" | "claimed" | "unclaimed"; limit?: number },
) {
  const params = new URLSearchParams();
  if (opts?.filter) params.set("filter", opts.filter);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();
  return apiFetch<{
    matrics: {
      id: string;
      code: string;
      claimedAt: string | null;
      claimed: boolean;
      user: { id: string; email: string; fullName: string } | null;
    }[];
  }>(`/admin/matrics${q ? `?${q}` : ""}`, { token });
}

export function adminRevokeMatric(id: string, token: string) {
  return apiFetch<{
    id: string;
    code: string;
    mode: "deleted" | "released";
  }>(`/admin/matrics/${id}/revoke`, {
    method: "POST",
    token,
  });
}

export function adminListConsultations(token: string, status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{
    consultations: {
      id: string;
      guestName: string;
      guestEmail: string;
      serviceType: string;
      projectBrief: string;
      attachmentKey: string | null;
      slotStartsAt: string;
      timezone: string;
      status: string;
      createdAt: string;
    }[];
  }>(`/admin/consultations${q}`, { token });
}

export function adminUpdateConsultationStatus(
  id: string,
  status: string,
  token: string,
) {
  return apiFetch<{ id: string; status: string }>(
    `/admin/consultations/${id}/status`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    },
  );
}

export function adminListOrders(token: string, status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{
    orders: {
      id: string;
      email: string;
      status: string;
      currency: string;
      totalAmount: number;
      paymentProvider: string | null;
      paymentRef: string | null;
      createdAt: string;
      items: {
        quantity: number;
        unitPrice: number;
        product: { title: string; slug: string };
      }[];
    }[];
  }>(`/admin/orders${q}`, { token });
}

export function adminListProducts(token: string) {
  return apiFetch<{
    products: {
      id: string;
      slug: string;
      title: string;
      description: string;
      type: string;
      stock: number;
      isPublished: boolean;
      priceNgn: number;
      priceUsd: number;
      imageKey: string | null;
      digitalKey: string | null;
    }[];
  }>("/admin/products", { token });
}

export function adminCreateProduct(
  input: {
    slug: string;
    title: string;
    description: string;
    type: "PHYSICAL" | "DIGITAL";
    priceNgn: number;
    priceUsd: number;
    stock?: number;
    isPublished?: boolean;
    imageKey?: string | null;
    digitalKey?: string | null;
  },
  token: string,
) {
  return apiFetch<{ id: string; slug: string }>("/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function adminUpdateProduct(
  id: string,
  input: {
    title?: string;
    description?: string;
    slug?: string;
    stock?: number;
    isPublished?: boolean;
    priceNgn?: number;
    priceUsd?: number;
    imageKey?: string | null;
    digitalKey?: string | null;
  },
  token: string,
) {
  return apiFetch<{ id: string; stock: number; isPublished: boolean }>(
    `/admin/products/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(input),
    },
  );
}

export function adminListLmsCourses(token: string) {
  return apiFetch<{
    courses: {
      id: string;
      slug: string;
      title: string;
      description: string;
      isPublished: boolean;
      sortOrder: number;
      modules: {
        id: string;
        slug: string;
        title: string;
        description: string | null;
        sortOrder: number;
        lessons: {
          id: string;
          slug: string;
          title: string;
          isPreview: boolean;
          isPublished: boolean;
          schematicKey: string | null;
          videoUrl: string | null;
          sortOrder: number;
          markdownBody: string;
        }[];
      }[];
    }[];
  }>("/admin/lms/courses", { token });
}

export function adminUpsertCourse(
  input: {
    id?: string;
    slug: string;
    title: string;
    description: string;
    isPublished?: boolean;
    sortOrder?: number;
  },
  token: string,
) {
  return apiFetch<{ id: string; slug: string }>("/admin/lms/courses", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function adminUpsertModule(
  input: {
    id?: string;
    courseId: string;
    slug: string;
    title: string;
    description?: string | null;
    sortOrder?: number;
  },
  token: string,
) {
  return apiFetch<{ id: string; slug: string }>("/admin/lms/modules", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function adminUpsertLesson(
  input: {
    id?: string;
    moduleId: string;
    slug: string;
    title: string;
    markdownBody: string;
    schematicKey?: string | null;
    videoUrl?: string | null;
    isPreview?: boolean;
    isPublished?: boolean;
    sortOrder?: number;
  },
  token: string,
) {
  return apiFetch<{ id: string; slug: string; isPublished: boolean }>(
    "/admin/lms/lessons",
    {
      method: "POST",
      token,
      body: JSON.stringify(input),
    },
  );
}

export function adminListForumThreads(token: string) {
  return apiFetch<{
    threads: {
      id: string;
      title: string;
      isLocked: boolean;
      isPinned: boolean;
      replyCount: number;
      createdAt: string;
      author: { id: string; fullName: string; email: string };
      category: { slug: string; title: string };
    }[];
  }>("/admin/forum/threads", { token });
}

export function adminSetForumThreadLocked(
  id: string,
  locked: boolean,
  token: string,
) {
  return apiFetch<{ id: string; title: string; isLocked: boolean }>(
    `/admin/forum/threads/${id}/lock`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ locked }),
    },
  );
}

export {
  IDEMPOTENT_POSTS,
  OPENAPI_PATHS,
  isIdempotentPostPath,
} from "@/lib/api/contract";
export type { ApiPaths, IdempotentPostPath, paths as OpenApiPaths } from "@/lib/api/contract";
