import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-10 text-[30px] font-bold leading-tight tracking-tight text-on-surface first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-9 border-b border-outline-variant/40 pb-2 text-[24px] font-bold leading-snug tracking-tight text-on-surface first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-7 text-xl font-semibold leading-snug text-on-surface first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-6 text-lg font-semibold leading-snug text-on-surface first:mt-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1.5 mt-5 text-base font-semibold text-on-surface first:mt-0">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1.5 mt-5 text-sm font-semibold uppercase tracking-wide text-on-surface-variant first:mt-0">
      {children}
    </h6>
  ),

  p: ({ children }) => <p className="my-4 text-[15px] leading-[1.75] text-on-surface/90 first:mt-0 last:mb-0">{children}</p>,

  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="break-words font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),

  img: ({ src, alt }) => (
    <span className="my-5 block overflow-hidden rounded-2xl shadow-xs">
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="max-w-full" />
    </span>
  ),

  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match && !String(children).includes("\n");
    return isInline ? (
      <code className="rounded-lg bg-tertiary-container/70 px-1.5 py-0.5 font-mono text-[13px] text-on-tertiary-container">
        {children}
      </code>
    ) : (
      <code className="block overflow-x-auto bg-transparent p-0 font-mono text-[13.5px] leading-relaxed text-inherit">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-2xl bg-surface-highest p-5 text-on-surface/95">{children}</pre>
  ),

  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-2xl border border-outline-variant/50">
      <table>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-container-high">{children}</thead>,
  th: ({ children }) => (
    <th className="whitespace-nowrap px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wide text-on-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-outline-variant/40 px-4 py-2.5 align-top text-sm leading-relaxed text-on-surface/90">
      {children}
    </td>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-2xl bg-secondary-container/60 px-5 py-4 [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
      {children}
    </blockquote>
  ),

  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-primary">{children}</ol>,
  li: ({ children }) => <li className="text-[15px] leading-relaxed text-on-surface/90">{children}</li>,

  input: (props) => <input {...props} className="mr-2 size-4 shrink-0 align-middle accent-[rgb(var(--md-primary))]" />,

  hr: () => <hr className="my-8 border-0 h-px bg-outline-variant/60" />,

  del: ({ children }) => <del className="opacity-70">{children}</del>,
};

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-on-surface">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
