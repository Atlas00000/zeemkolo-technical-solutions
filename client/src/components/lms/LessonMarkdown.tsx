"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CodeBlock } from "@/components/lms/CodeBlock";

type LessonMarkdownProps = {
  markdown: string;
  gated?: boolean;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "math"; tex: string };

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "text";
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      i += 1;
      continue;
    }

    if (line.startsWith("$$") && line.endsWith("$$") && line.length > 4) {
      blocks.push({ type: "math", tex: line.slice(2, -2).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("$$")) {
      const texLines: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("$$")) {
        texLines.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push({ type: "math", tex: texLines.join(" ").trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: line.slice(4) });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3) });
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "heading", level: 1, text: line.slice(2) });
      i += 1;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("1. ")) {
      const items: string[] = [];
      while (i < lines.length && (/^-\s/.test(lines[i] ?? "") || /^\d+\.\s/.test(lines[i] ?? ""))) {
        items.push((lines[i] ?? "").replace(/^(-|\d+\.)\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !(lines[i] ?? "").startsWith("#") &&
      !(lines[i] ?? "").startsWith("```") &&
      !(lines[i] ?? "").startsWith("$$") &&
      !(lines[i] ?? "").startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i] ?? "")
    ) {
      paragraph.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="bg-brand-mist px-1 py-0.5 font-mono text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function LessonMarkdown({ markdown, gated }: LessonMarkdownProps) {
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div className="space-y-4 text-brand-ink">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 key={index} className="font-display text-3xl">
                {block.text}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={index} className="font-display text-2xl">
                {block.text}
              </h2>
            );
          }
          return (
            <h3 key={index} className="font-display text-xl">
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="leading-relaxed text-brand-steel">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-brand-steel">
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "code") {
          return <CodeBlock key={index} code={block.code} language={block.language} />;
        }

        let html = block.tex;
        try {
          html = katex.renderToString(block.tex, {
            throwOnError: false,
            displayMode: true,
          });
        } catch {
          /* keep raw tex */
        }
        return (
          <div
            key={index}
            className="overflow-x-auto border border-brand-steel/15 bg-white px-4 py-3 text-brand-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}

      {gated ? (
        <div className="rounded border border-brand-signal/40 bg-orange-50 px-4 py-4 text-sm text-brand-ink">
          Full lesson content is available to Zeemble students.{" "}
          <a href="/sign-up" className="underline underline-offset-2">
            Sign up
          </a>{" "}
          to unlock the library.
        </div>
      ) : null}
    </div>
  );
}
