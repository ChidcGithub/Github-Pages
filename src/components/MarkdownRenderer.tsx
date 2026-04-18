import { useMemo } from "react";
import * as React from "react";

/* ── AST types ── */

type ASTNode =
  | { type: "heading"; level: number; content: string }
  | { type: "paragraph"; content: string }
  | { type: "code"; content: string; lang: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string; title?: string }
  | { type: "html"; content: string }
  | { type: "blank" };

/* ── parser ── */

function parseMarkdown(md: string): ASTNode[] {
  const lines = md.split("\n");
  const nodes: ASTNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // HTML blocks
    if (line.match(/^<\/?[a-z]/i)) {
      const htmlLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^<\/?[a-z][^>]*>\s*$/i)) {
        htmlLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        htmlLines.push(lines[i]);
        i++;
      }
      nodes.push({ type: "html", content: htmlLines.join("\n") });
      continue;
    }

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push({ type: "code", content: codeLines.join("\n"), lang });
      i++; // skip closing ```
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      nodes.push({ type: "heading", level: hMatch[1].length, content: hMatch[2].trim() });
      i++;
      continue;
    }

    // Thematic break
    if (line.match(/^(\*{3,}|-{3,}|_{3,})\s*$/)) {
      nodes.push({ type: "hr" });
      i++;
      continue;
    }

    // Image
    const imgMatch = line.match(/!\[([^\]]*)\]\((\S+)(?:\s+"([^"]*)")?\)/);
    if (imgMatch && !line.startsWith("- ") && !line.startsWith("* ")) {
      nodes.push({ type: "image", src: imgMatch[2], alt: imgMatch[1], title: imgMatch[3] });
      i++;
      continue;
    }

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[\s:-]+\|/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const parsed = parseTable(tableLines);
      if (parsed) nodes.push(parsed);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const bLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        bLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push({ type: "blockquote", lines: bLines });
      continue;
    }

    // Unordered list
    if (line.match(/^(\s*)[-*+]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^(\s*)[-*+]\s/)) {
        items.push(lines[i].replace(/^(\s*)[-*+]\s/, ""));
        i++;
      }
      nodes.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push({ type: "ol", items });
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].match(/^(\s*)[-*+]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      !lines[i].startsWith("> ") &&
      !lines[i].match(/^(\*{3,}|-{3,}|_{3,})\s*$/) &&
      !lines[i].startsWith("![") &&
      !lines[i].match(/^<\/?[a-z]/i) &&
      !(lines[i].includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[\s:-]+\|/))
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push({ type: "paragraph", content: paraLines.join(" ") });
    }
  }

  return nodes;
}

function parseTable(tableLines: string[]): { type: "table"; header: string[]; rows: string[][] } | null {
  const rows: string[][] = [];
  for (const line of tableLines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, idx, arr) => {
        // Remove empty first/last cells from leading/trailing pipes
        if (idx === 0 && c === "") return false;
        if (idx === arr.length - 1 && c === "") return false;
        return true;
      });
    if (cells.length === 0) continue;
    // Skip separator row
    if (cells.every((c) => /^[-:]+$/.test(c))) continue;
    rows.push(cells);
  }
  if (rows.length === 0) return null;
  return { type: "table", header: rows[0], rows: rows.slice(1) };
}

/* ── inline formatting ── */

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Image: ![alt](url)
    const imgMatch = remaining.match(/!\[([^\]]*)\]\((\S+)(?:\s+"([^"]*)")?\)/);
    if (imgMatch && imgMatch.index !== undefined) {
      if (imgMatch.index > 0) {
        parts.push(...renderInlineBasic(remaining.slice(0, imgMatch.index)));
      }
      parts.push(
        <img
          key={key++}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          title={imgMatch[3]}
          style={{ maxWidth: "100%", borderRadius: 6, margin: "8px 0" }}
        />
      );
      remaining = remaining.slice(imgMatch.index + imgMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\((\S+)(?:\s+"([^"]*)")?\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      if (linkMatch.index > 0) {
        parts.push(...renderInlineBasic(remaining.slice(0, linkMatch.index)));
      }
      parts.push(
        <a key={key++} href={linkMatch[2]} title={linkMatch[3] || undefined}>
          {renderInlineBasic(linkMatch[1])}
        </a>
      );
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // Fall through: just render the rest as basic inline
    parts.push(...renderInlineBasic(remaining));
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderInlineBasic(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Strong: **text** or __text__
    const strongMatch = remaining.match(/\*\*(.+?)\*\*/);
    const emMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const strikeMatch = remaining.match(/~~(.+?)~~/);

    // Find the earliest match
    let earliestIdx = Infinity;
    let earliestType = "";
    let earliestLen = 0;

    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index < earliestIdx) {
        earliestIdx = codeMatch.index;
        earliestType = "code";
        earliestLen = codeMatch[0].length;
      }
    }
    if (strongMatch && strongMatch.index !== undefined) {
      if (strongMatch.index < earliestIdx) {
        earliestIdx = strongMatch.index;
        earliestType = "strong";
        earliestLen = strongMatch[0].length;
      }
    }
    if (emMatch && emMatch.index !== undefined) {
      if (emMatch.index < earliestIdx) {
        earliestIdx = emMatch.index;
        earliestType = "em";
        earliestLen = emMatch[0].length;
      }
    }
    if (strikeMatch && strikeMatch.index !== undefined) {
      if (strikeMatch.index < earliestIdx) {
        earliestIdx = strikeMatch.index;
        earliestType = "strike";
        earliestLen = strikeMatch[0].length;
      }
    }

    if (earliestIdx >= remaining.length) {
      if (remaining) result.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliestIdx > 0) {
      result.push(<span key={key++}>{remaining.slice(0, earliestIdx)}</span>);
    }

    const inner = remaining.slice(earliestIdx + 2, earliestIdx + earliestLen - 2);

    switch (earliestType) {
      case "code":
        result.push(<code key={key++}>{inner}</code>);
        break;
      case "strong":
        result.push(<strong key={key++}>{renderInlineBasic(inner)}</strong>);
        break;
      case "em":
        result.push(<em key={key++}>{renderInlineBasic(inner)}</em>);
        break;
      case "strike":
        result.push(<del key={key++}>{inner}</del>);
        break;
    }

    remaining = remaining.slice(earliestIdx + earliestLen);
  }

  return result;
}

/* ── sub-components ── */

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="my-4" style={{ borderRadius: 6, overflow: "hidden", backgroundColor: "#f6f8fa" }}>
      {lang && (
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 36, backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}
        >
          <span style={{ fontSize: 12, color: "#57606a" }}>{lang}</span>
          <button
            style={{ fontSize: 11, color: "#57606a", padding: "2px 8px", borderRadius: 4, border: "1px solid #d0d7de", background: "#fff", cursor: "pointer" }}
            onClick={() => navigator.clipboard.writeText(code)}
          >
            Copy
          </button>
        </div>
      )}
      <pre
        style={{
          padding: "16px 20px",
          overflow: "auto",
          margin: 0,
        }}
      >
        <code style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace", fontSize: 13, lineHeight: 1.7, color: "#24292f" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function TableBlock({ header, rows }: { header: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#2d333b",
                  borderBottom: "2px solid #d0d7de",
                  whiteSpace: "nowrap",
                }}
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #e5e7eb" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "8px 12px", color: "#2d333b", lineHeight: 1.5 }}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockquoteBlock({ lines }: { lines: string[] }) {
  return (
    <div
      className="my-4"
      style={{
        borderLeft: "3px solid #0969da",
        backgroundColor: "#f6f8fa",
        padding: "12px 16px",
        borderRadius: "0 6px 6px 0",
        fontSize: 14,
        lineHeight: 1.6,
        color: "#2d333b",
      }}
    >
      {lines.map((line, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
          {renderInline(line)}
        </p>
      ))}
    </div>
  );
}

/* ── main component ── */

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_STYLES: Record<HeadingLevel, React.CSSProperties> = {
  1: { fontSize: 28, fontWeight: 400, color: "#2d333b", lineHeight: 1.3 },
  2: { fontSize: 22, fontWeight: 600, color: "#2d333b", lineHeight: 1.3 },
  3: { fontSize: 18, fontWeight: 600, color: "#2d333b", lineHeight: 1.4 },
  4: { fontSize: 16, fontWeight: 600, color: "#2d333b", lineHeight: 1.4 },
  5: { fontSize: 14, fontWeight: 600, color: "#2d333b", lineHeight: 1.4 },
  6: { fontSize: 13, fontWeight: 600, color: "#2d333b", lineHeight: 1.4 },
};

const HEADING_TAG: Record<HeadingLevel, string> = {
  1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6",
};

const HEADING_MARGIN: Record<HeadingLevel, string> = {
  1: "mt-10 mb-4", 2: "mt-8 mb-3", 3: "mt-6 mb-2",
  4: "mt-6 mb-2", 5: "mt-4 mb-2", 6: "mt-4 mb-2",
};

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  const nodes = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "heading": {
            const level = node.level as HeadingLevel;
            const Tag = HEADING_TAG[level];
            return (
              <div
                key={i}
                className={HEADING_MARGIN[level]}
              >
                {React.createElement(Tag, {
                  style: HEADING_STYLES[level],
                  children: renderInline(node.content),
                })}
              </div>
            );
          }
          case "paragraph":
            return (
              <p
                key={i}
                className="my-3"
                style={{ fontSize: 16, lineHeight: 1.6, color: "#2d333b" }}
              >
                {renderInline(node.content)}
              </p>
            );
          case "code":
            return <CodeBlock key={i} code={node.content} lang={node.lang} />;
          case "table":
            return <TableBlock key={i} header={node.header} rows={node.rows} />;
          case "blockquote":
            return <BlockquoteBlock key={i} lines={node.lines} />;
          case "ul":
            return (
              <ul key={i} className="my-3" style={{ paddingLeft: 24 }}>
                {node.items.map((item, j) => (
                  <li
                    key={j}
                    className="mb-1.5"
                    style={{ fontSize: 16, lineHeight: 1.6, color: "#2d333b" }}
                  >
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="my-3" style={{ paddingLeft: 24 }}>
                {node.items.map((item, j) => (
                  <li
                    key={j}
                    className="mb-1.5"
                    style={{ fontSize: 16, lineHeight: 1.6, color: "#2d333b" }}
                  >
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "hr":
            return <hr key={i} style={{ border: "none", borderTop: "1px solid #d0d7de", margin: "24px 0" }} />;
          case "image":
            return (
              <img
                key={i}
                src={node.src}
                alt={node.alt}
                title={node.title}
                style={{ maxWidth: "100%", borderRadius: 6, margin: "8px 0" }}
              />
            );
          case "html":
            return <div key={i} dangerouslySetInnerHTML={{ __html: node.content }} />;
          case "blank":
            return null;
          default:
            return null;
        }
      })}
    </div>
  );
}
