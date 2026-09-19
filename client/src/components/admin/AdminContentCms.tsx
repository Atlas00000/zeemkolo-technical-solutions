"use client";

import { useState } from "react";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminListLmsCourses,
  adminUpsertCourse,
  adminUpsertLesson,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type Product = Awaited<
  ReturnType<typeof import("@/lib/api-client").adminListProducts>
>["products"][number];

type Course = Awaited<ReturnType<typeof adminListLmsCourses>>["courses"][number];

export function AdminStoreCms({
  token,
  products,
  onChanged,
}: {
  token: string;
  products: Product[];
  onChanged: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    type: "PHYSICAL" as "PHYSICAL" | "DIGITAL",
    priceNgn: 0,
    priceUsd: 0,
    stock: 0,
    digitalKey: "",
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-[var(--ln-ink)]">Store inventory</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Cancel" : "New product"}
        </Button>
      </div>

      {creating ? (
        <form
          className="space-y-3 border border-[var(--ln-hairline)] bg-[var(--ln-plane)] p-4 text-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              await adminCreateProduct(
                {
                  ...form,
                  digitalKey: form.digitalKey || null,
                  isPublished: false,
                },
                token,
              );
              setCreating(false);
              onChanged();
            })();
          }}
        >
          {(
            [
              ["slug", "Slug"],
              ["title", "Title"],
              ["description", "Description"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-[var(--ln-muted)]">
              {label}
              <input
                className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </label>
          ))}
          <label className="block text-[var(--ln-muted)]">
            Type
            <select
              className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "PHYSICAL" | "DIGITAL",
                })
              }
            >
              <option value="PHYSICAL">PHYSICAL</option>
              <option value="DIGITAL">DIGITAL</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="text-[var(--ln-muted)]">
              Price NGN (kobo)
              <input
                type="number"
                min={0}
                className="ml-2 w-28 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                value={form.priceNgn}
                onChange={(e) =>
                  setForm({ ...form, priceNgn: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="text-[var(--ln-muted)]">
              Price USD (cents)
              <input
                type="number"
                min={0}
                className="ml-2 w-28 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                value={form.priceUsd}
                onChange={(e) =>
                  setForm({ ...form, priceUsd: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="text-[var(--ln-muted)]">
              Stock
              <input
                type="number"
                min={0}
                className="ml-2 w-20 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) || 0 })
                }
              />
            </label>
          </div>
          <label className="block text-[var(--ln-muted)]">
            Digital key (R2)
            <input
              className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
              value={form.digitalKey}
              onChange={(e) => setForm({ ...form, digitalKey: e.target.value })}
              placeholder="ebooks/example.pdf"
            />
          </label>
          <Button type="submit">Create product</Button>
        </form>
      ) : null}

      <ul className="space-y-4">
        {products.map((p) => (
          <li key={p.id} className="border-t border-[var(--ln-hairline)] pt-4">
            <p className="font-medium text-[var(--ln-ink)]">
              {p.title}{" "}
              <span className="text-sm text-[var(--ln-faint)]">
                ({p.type} · {p.slug})
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ln-muted)]">
              {p.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <label className="text-[var(--ln-muted)]">
                Stock
                <input
                  type="number"
                  min={0}
                  defaultValue={p.stock}
                  className="ml-2 w-20 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                  onBlur={(e) => {
                    const stock = Number(e.target.value);
                    if (!Number.isFinite(stock) || stock === p.stock) return;
                    void (async () => {
                      await adminUpdateProduct(p.id, { stock }, token);
                      onChanged();
                    })();
                  }}
                />
              </label>
              <label className="text-[var(--ln-muted)]">
                NGN kobo
                <input
                  type="number"
                  min={0}
                  defaultValue={p.priceNgn}
                  className="ml-2 w-28 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
                  onBlur={(e) => {
                    const priceNgn = Number(e.target.value);
                    if (!Number.isFinite(priceNgn) || priceNgn === p.priceNgn)
                      return;
                    void (async () => {
                      await adminUpdateProduct(p.id, { priceNgn }, token);
                      onChanged();
                    })();
                  }}
                />
              </label>
              <label className="flex items-center gap-2 text-[var(--ln-muted)]">
                <input
                  type="checkbox"
                  checked={p.isPublished}
                  onChange={(e) => {
                    void (async () => {
                      await adminUpdateProduct(
                        p.id,
                        { isPublished: e.target.checked },
                        token,
                      );
                      onChanged();
                    })();
                  }}
                />
                Published
              </label>
            </div>
            {p.digitalKey ? (
              <p className="mt-1 font-mono text-xs text-[var(--ln-muted)]">
                digitalKey: {p.digitalKey}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminLmsCms({
  token,
  courses,
  onChanged,
}: {
  token: string;
  courses: Course[];
  onChanged: () => void;
}) {
  const [moduleId, setModuleId] = useState(courses[0]?.modules[0]?.id ?? "");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    slug: "",
    title: "",
    markdownBody: "# New lesson\n\n",
    schematicKey: "",
    isPreview: false,
    isPublished: false,
  });

  const flatModules = courses.flatMap((c) =>
    c.modules.map((m) => ({
      ...m,
      courseTitle: c.title,
      courseId: c.id,
    })),
  );

  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl text-[var(--ln-ink)]">LMS content</h2>

      <ul className="space-y-4 text-sm">
        {courses.map((c) => (
          <li key={c.id} className="border-t border-[var(--ln-hairline)] pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-[var(--ln-ink)]">
                {c.title}{" "}
                <span className="text-[var(--ln-faint)]">({c.slug})</span>
              </p>
              <label className="flex items-center gap-2 text-[var(--ln-muted)]">
                <input
                  type="checkbox"
                  checked={c.isPublished}
                  onChange={(e) => {
                    void (async () => {
                      await adminUpsertCourse(
                        {
                          id: c.id,
                          slug: c.slug,
                          title: c.title,
                          description: c.description,
                          isPublished: e.target.checked,
                          sortOrder: c.sortOrder,
                        },
                        token,
                      );
                      onChanged();
                    })();
                  }}
                />
                Course published
              </label>
            </div>
            {c.modules.map((m) => (
              <div key={m.id} className="mt-3 ml-2">
                <p className="text-[var(--ln-muted)]">
                  Module: {m.title}{" "}
                  <span className="text-[var(--ln-faint)]">({m.slug})</span>
                </p>
                <ul className="mt-2 space-y-2">
                  {m.lessons.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ln-hairline)] pt-2"
                    >
                      <span className="text-[var(--ln-ink)]">
                        {l.title}{" "}
                        <span className="text-[var(--ln-faint)]">
                          {l.isPublished ? "published" : "draft"}
                          {l.isPreview ? " · preview" : ""}
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-primary"
                          onClick={() => {
                            setModuleId(m.id);
                            setEditingLessonId(l.id);
                            setLessonForm({
                              slug: l.slug,
                              title: l.title,
                              markdownBody: l.markdownBody,
                              schematicKey: l.schematicKey ?? "",
                              isPreview: l.isPreview,
                              isPublished: l.isPublished,
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            void (async () => {
                              await adminUpsertLesson(
                                {
                                  id: l.id,
                                  moduleId: m.id,
                                  slug: l.slug,
                                  title: l.title,
                                  markdownBody: l.markdownBody,
                                  schematicKey: l.schematicKey,
                                  videoUrl: l.videoUrl,
                                  isPreview: l.isPreview,
                                  isPublished: !l.isPublished,
                                  sortOrder: l.sortOrder,
                                },
                                token,
                              );
                              onChanged();
                            })();
                          }}
                        >
                          {l.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </li>
        ))}
      </ul>

      <form
        className="space-y-3 border border-[var(--ln-hairline)] bg-[var(--ln-plane)] p-4 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!moduleId) return;
          void (async () => {
            await adminUpsertLesson(
              {
                id: editingLessonId ?? undefined,
                moduleId,
                slug: lessonForm.slug,
                title: lessonForm.title,
                markdownBody: lessonForm.markdownBody,
                schematicKey: lessonForm.schematicKey || null,
                isPreview: lessonForm.isPreview,
                isPublished: lessonForm.isPublished,
              },
              token,
            );
            setEditingLessonId(null);
            setLessonForm({
              slug: "",
              title: "",
              markdownBody: "# New lesson\n\n",
              schematicKey: "",
              isPreview: false,
              isPublished: false,
            });
            onChanged();
          })();
        }}
      >
        <h3 className="font-display text-lg text-[var(--ln-ink)]">
          {editingLessonId ? "Edit lesson" : "Create lesson"}
        </h3>
        <label className="block text-[var(--ln-muted)]">
          Module
          <select
            className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
          >
            {flatModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.courseTitle} / {m.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[var(--ln-muted)]">
          Slug
          <input
            className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
            value={lessonForm.slug}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, slug: e.target.value })
            }
            required
          />
        </label>
        <label className="block text-[var(--ln-muted)]">
          Title
          <input
            className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
            value={lessonForm.title}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, title: e.target.value })
            }
            required
          />
        </label>
        <label className="block text-[var(--ln-muted)]">
          Schematic key
          <input
            className="mt-1 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1"
            value={lessonForm.schematicKey}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, schematicKey: e.target.value })
            }
            placeholder="/schematics/series-circuit.jpg"
          />
        </label>
        <label className="block text-[var(--ln-muted)]">
          Markdown body
          <textarea
            className="mt-1 min-h-40 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-2 py-1 font-mono text-xs"
            value={lessonForm.markdownBody}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, markdownBody: e.target.value })
            }
            required
          />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-[var(--ln-muted)]">
            <input
              type="checkbox"
              checked={lessonForm.isPreview}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, isPreview: e.target.checked })
              }
            />
            Preview (public)
          </label>
          <label className="flex items-center gap-2 text-[var(--ln-muted)]">
            <input
              type="checkbox"
              checked={lessonForm.isPublished}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, isPublished: e.target.checked })
              }
            />
            Published
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">
            {editingLessonId ? "Save lesson" : "Create lesson"}
          </Button>
          {editingLessonId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingLessonId(null)}
            >
              Clear edit
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
