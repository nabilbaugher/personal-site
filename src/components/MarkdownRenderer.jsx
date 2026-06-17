import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

/**
 * Preprocess markdown:
 * - Convert Obsidian-style image links ![[file.png|width]] to standard markdown
 * - Normalize line endings
 */
function preprocess(md) {
  return md.replace(/!\[\[([^\]|]+?)(?:\|(\d+))?\]\]/g, (_, file, width) => {
    const src = `/blog_posts/${file}`;
    return width
      ? `<img src="${src}" alt="${file}" width="${width}" />`
      : `![${file}](${src})`;
  });
}

const components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl font-normal text-neutral-900 mt-14 mb-6 pb-2 border-b border-neutral-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-normal text-neutral-800 mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-normal text-neutral-700 mt-8 mb-3">
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children, node }) => {
    // Check if this paragraph only contains an img — if so, render as figure
    const child = node?.children;
    if (child?.length === 1 && child[0].tagName === "img") {
      return <>{children}</>;
    }
    return (
      <p className="text-sm text-neutral-600 leading-[1.85] mb-4">{children}</p>
    );
  },

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-4 border-l-4 border-amber-800/30 text-sm text-neutral-600 leading-[1.85] italic">
      {children}
    </blockquote>
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-amber-800 underline underline-offset-2 decoration-amber-800/30 hover:decoration-amber-800/60 transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Images
  img: ({ src, alt, width }) => (
    <figure className="my-8 flex flex-col items-center">
      <img
        src={src}
        alt={alt || ""}
        width={width}
        className="rounded max-w-full"
        style={width ? { width: `${width}px` } : undefined}
      />
    </figure>
  ),

  // Inline code
  code: ({ children, className, ...props }) => {
    // Block code is handled by pre > code; this catches inline code only
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-[0.85em] px-1.5 py-0.5 rounded bg-neutral-100 text-amber-900 border border-neutral-200">
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Code blocks
  pre: ({ children }) => (
    <pre className="my-6 p-5 rounded-lg bg-neutral-900 text-neutral-200 text-xs leading-relaxed overflow-x-auto border border-neutral-800">
      {children}
    </pre>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="my-4 ml-5 space-y-1.5 list-disc marker:text-neutral-300 text-sm text-neutral-600 leading-[1.85]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-5 space-y-1.5 list-decimal marker:text-neutral-400 text-sm text-neutral-600 leading-[1.85]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  // Tables (GFM)
  table: ({ children }) => (
    <div className="my-8 -mx-4 sm:-mx-8 md:-mx-12 overflow-x-auto px-4 sm:px-8 md:px-12">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-neutral-300 text-left text-neutral-700">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-neutral-200">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="py-2 pr-4 font-medium text-neutral-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="py-2 pr-4 text-neutral-600 align-top">{children}</td>
  ),

  // Horizontal rule
  hr: () => <hr className="my-10 border-none h-px bg-neutral-200" />,

  // Strong / em
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-800">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-neutral-700">{children}</em>,
};

export default function MarkdownRenderer({ content }) {
  const processed = preprocess(content);

  return (
    <article className="font-mono">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
      >
        {processed}
      </ReactMarkdown>
    </article>
  );
}
