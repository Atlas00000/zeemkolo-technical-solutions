const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type AppUser = {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  role: "PUBLIC_VISITOR" | "GENERAL_CUSTOMER" | "ZEEMBLE_STUDENT" | "ADMIN";
  matric: { code: string; claimedAt: string | null } | null;
};

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
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
