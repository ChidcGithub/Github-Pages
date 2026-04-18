import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const MARKDOWN_STYLES: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: "#2d333b",
};

const HEADING_STYLES: Record<string, React.CSSProperties> = {
  h1: { fontSize: 28, fontWeight: 400, color: "#2d333b", lineHeight: 1.3, marginTop: 40, marginBottom: 16 },
  h2: { fontSize: 22, fontWeight: 600, color: "#2d333b", lineHeight: 1.3, marginTop: 32, marginBottom: 12 },
  h3: { fontSize: 18, fontWeight: 600, color: "#2d333b", lineHeight: 1.4, marginTop: 24, marginBottom: 8 },
  h4: { fontSize: 16, fontWeight: 600, color: "#2d333b", lineHeight: 1.4, marginTop: 24, marginBottom: 8 },
  h5: { fontSize: 14, fontWeight: 600, color: "#2d333b", lineHeight: 1.4, marginTop: 16, marginBottom: 8 },
  h6: { fontSize: 13, fontWeight: 600, color: "#2d333b", lineHeight: 1.4, marginTop: 16, marginBottom: 8 },
};

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div style={MARKDOWN_STYLES}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1 {...props} style={HEADING_STYLES.h1}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} style={HEADING_STYLES.h2}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} style={HEADING_STYLES.h3}>{children}</h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 {...props} style={HEADING_STYLES.h4}>{children}</h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 {...props} style={HEADING_STYLES.h5}>{children}</h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 {...props} style={HEADING_STYLES.h6}>{children}</h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p style={{ margin: "12px 0", fontSize: 15, lineHeight: 1.6, color: "#2d333b" }}>
              {children}
            </p>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: "#0969da", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {children}
            </a>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: "100%", borderRadius: 6, margin: "12px 0" }}
            />
          ),

          // Code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return isInline ? (
              <code
                {...props}
                style={{
                  backgroundColor: "#f6f8fa",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
                }}
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                style={{
                  fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              style={{
                backgroundColor: "#f6f8fa",
                padding: "16px 20px",
                borderRadius: 6,
                overflow: "auto",
                margin: "16px 0",
              }}
            >
              {children}
            </pre>
          ),

          // Tables
          table: ({ children }) => (
            <div style={{ overflowX: "auto", margin: "16px 0" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              style={{
                padding: "8px 12px",
                textAlign: "left",
                fontWeight: 600,
                color: "#2d333b",
                borderBottom: "2px solid #d0d7de",
                whiteSpace: "nowrap",
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: "8px 12px",
                color: "#2d333b",
                lineHeight: 1.5,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: "3px solid #0969da",
                backgroundColor: "#f6f8fa",
                padding: "12px 16px",
                borderRadius: "0 6px 6px 0",
                margin: "16px 0",
                color: "#2d333b",
              }}
            >
              {children}
            </blockquote>
          ),

          // Lists
          ul: ({ children }) => (
            <ul style={{ paddingLeft: 24, margin: "12px 0" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: 24, margin: "12px 0" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: 4, fontSize: 15, lineHeight: 1.6, color: "#2d333b" }}>
              {children}
            </li>
          ),

          // Horizontal rule
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid #d0d7de", margin: "24px 0" }} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
