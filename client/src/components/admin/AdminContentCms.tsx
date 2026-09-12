"use client";

import { useState } from "react";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminListLmsCourses,
  adminUpsertCourse,
  adminUpsertLesson,
} from "@/lib/api-client";

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
        <h2 className="font-display text-2xl text-brand-ink">Store inventory</h2>
        <button
          type="button"
          className="bg-brand-ink px-3 py-1.5 text-sm text-white"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Cancel" : "New product"}
        </button>
      </div>

      {creating ? (
        <form
          className="space-y-3 border border-brand-steel/20 bg-white/50 p-4 text-sm"
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
            <label key={key} className="block text-brand-steel">
              {label}
              <input
                className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </label>
          ))}
          <label className="block text-brand-steel">
            Type
            <select
              className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
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
            <label className="text-brand-steel">
              Price NGN (kobo)
              <input
                type="number"
                min={0}
                className="ml-2 w-28 border border-brand-steel/25 bg-white px-2 py-1"
                value={form.priceNgn}
                onChange={(e) =>
                  setForm({ ...form, priceNgn: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="text-brand-steel">
              Price USD (cents)
              <input
                type="number"
                min={0}
                className="ml-2 w-28 border border-brand-steel/25 bg-white px-2 py-1"
                value={form.priceUsd}
                onChange={(e) =>
                  setForm({ ...form, priceUsd: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="text-brand-steel">
              Stock
              <input
                type="number"
                min={0}
                className="ml-2 w-20 border border-brand-steel/25 bg-white px-2 py-1"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) || 0 })
                }
              />
            </label>
          </div>
          <label className="block text-brand-steel">
            Digital key (R2)
            <input
              className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
              value={form.digitalKey}
              onChange={(e) => setForm({ ...form, digitalKey: e.target.value })}
              placeholder="ebooks/example.pdf"
            />
          </label>
          <button type="submit" className="bg-brand-signal px-4 py-2 text-white">
            Create product
          </button>
        </form>
      ) : null}

      <ul className="space-y-4">
        {products.map((p) => (
          <li key={p.id} className="border-t border-brand-steel/15 pt-4">
            <p className="font-medium text-brand-ink">
              {p.title}{" "}
              <span className="text-sm text-brand-steel/70">
                ({p.type} · {p.slug})
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-brand-steel/80">
              {p.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <label className="text-brand-steel">
                Stock
                <input
                  type="number"
                  min={0}
                  defaultValue={p.stock}
                  className="ml-2 w-20 border border-brand-steel/25 bg-white px-2 py-1"
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
              <label className="text-brand-steel">
                NGN kobo
                <input
                  type="number"
                  min={0}
                  defaultValue={p.priceNgn}
                  className="ml-2 w-28 border border-brand-steel/25 bg-white px-2 py-1"
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
              <label className="flex items-center gap-2 text-brand-steel">
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
              <p className="mt-1 font-mono text-xs text-brand-steel">
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
      <h2 className="font-display text-2xl text-brand-ink">LMS content</h2>

      <ul className="space-y-4 text-sm">
        {courses.map((c) => (
          <li key={c.id} className="border-t border-brand-steel/15 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-ink">
                {c.title}{" "}
                <span className="text-brand-steel/70">({c.slug})</span>
              </p>
              <label className="flex items-center gap-2 text-brand-steel">
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
                <p className="text-brand-steel">
                  Module: {m.title}{" "}
                  <span className="text-brand-steel/60">({m.slug})</span>
                </p>
                <ul className="mt-2 space-y-2">
                  {m.lessons.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-steel/10 pt-2"
                    >
                      <span className="text-brand-ink">
                        {l.title}{" "}
                        <span className="text-brand-steel/60">
                          {l.isPublished ? "published" : "draft"}
                          {l.isPreview ? " · preview" : ""}
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-brand-signal underline-offset-2 hover:underline"
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
                        </button>
                        <button
                          type="button"
                          className="border border-brand-steel/25 px-2 py-0.5"
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
                        </button>
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
        className="space-y-3 border border-brand-steel/20 bg-white/50 p-4 text-sm"
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
        <h3 className="font-display text-lg text-brand-ink">
          {editingLessonId ? "Edit lesson" : "Create lesson"}
        </h3>
        <label className="block text-brand-steel">
          Module
          <select
            className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
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
        <label className="block text-brand-steel">
          Slug
          <input
            className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
            value={lessonForm.slug}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, slug: e.target.value })
            }
            required
          />
        </label>
        <label className="block text-brand-steel">
          Title
          <input
            className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
            value={lessonForm.title}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, title: e.target.value })
            }
            required
          />
        </label>
        <label className="block text-brand-steel">
          Schematic key
          <input
            className="mt-1 w-full border border-brand-steel/25 bg-white px-2 py-1"
            value={lessonForm.schematicKey}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, schematicKey: e.target.value })
            }
            placeholder="/schematics/sample-circuit.svg"
          />
        </label>
        <label className="block text-brand-steel">
          Markdown body
          <textarea
            className="mt-1 min-h-40 w-full border border-brand-steel/25 bg-white px-2 py-1 font-mono text-xs"
            value={lessonForm.markdownBody}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, markdownBody: e.target.value })
            }
            required
          />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-brand-steel">
            <input
              type="checkbox"
              checked={lessonForm.isPreview}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, isPreview: e.target.checked })
              }
            />
            Preview (public)
          </label>
          <label className="flex items-center gap-2 text-brand-steel">
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
          <button type="submit" className="bg-brand-signal px-4 py-2 text-white">
            {editingLessonId ? "Save lesson" : "Create lesson"}
          </button>
          {editingLessonId ? (
            <button
              type="button"
              className="border border-brand-steel/25 px-4 py-2"
              onClick={() => setEditingLessonId(null)}
            >
              Clear edit
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
