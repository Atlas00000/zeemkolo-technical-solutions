"use client";

import { useMemo, useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
};

export function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function onDownload() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename ?? `snippet.${language || "txt"}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const label = useMemo(() => language.toUpperCase(), [language]);

  return (
    <div className="overflow-hidden border border-brand-steel/20 bg-[#0f1720] text-[#e8eef2]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs">
        <span className="tracking-[0.12em] text-white/70">{label}</span>
        <div className="flex gap-2">
          <button type="button" onClick={onCopy} className="hover:text-white">
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onDownload} className="hover:text-white">
            Download
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
