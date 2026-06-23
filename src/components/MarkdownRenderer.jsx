import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

function renderImageButton({ src, alt, width, imageClassName, openImage }) {
  return (
    <button
      type="button"
      className="group inline-flex cursor-zoom-in justify-start"
      onClick={() => openImage({ src, alt: alt || "" })}
      aria-label={alt ? `Open image: ${alt}` : "Open image"}
    >
      <img
        src={src}
        alt={alt || ""}
        width={width}
        className={`${imageClassName} transition-opacity group-hover:opacity-90`}
        style={width ? { width: `${width}px` } : undefined}
      />
    </button>
  );
}

function clampZoom(value) {
  return Math.min(Math.max(value, 0.5), 4);
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

const presets = {
  warmSans: {
    article: "markdown-body markdown-body-warm",
    h1: "mt-14 mb-6 border-b border-[#d8cec2] pb-3 text-3xl font-light leading-tight tracking-normal text-[#211c17]",
    h2: "mt-12 mb-5 text-2xl font-normal leading-tight tracking-normal text-[#2f2923]",
    h3: "mt-9 mb-3 text-xl font-normal leading-tight tracking-normal text-[#3c332b]",
    p: "mb-5 text-[1rem] leading-8 text-[#5f5449]",
    blockquote:
      "my-8 border-l border-[#bba78f] pl-5 text-[1rem] leading-8 text-[#66594d] italic",
    link: "text-[#7d5e3f] underline decoration-[#b9a48c] underline-offset-4 transition-colors hover:text-[#4b3828] hover:decoration-[#7d5e3f]",
    img: "max-w-full border border-[#d8cec2]",
    inlineCode:
      "border border-[#d8cec2] bg-[#f5efe4] px-1.5 py-0.5 text-[0.85em] text-[#6d4e32]",
    pre: "my-8 overflow-x-auto border border-[#d8cec2] bg-[#2b241e] p-5 text-xs leading-relaxed text-[#f5efe4]",
    ul: "my-5 ml-5 list-disc space-y-2 text-[1rem] leading-8 text-[#5f5449] marker:text-[#b9a48c]",
    ol: "my-5 ml-5 list-decimal space-y-2 text-[1rem] leading-8 text-[#5f5449] marker:text-[#9c8c7a]",
    tableWrap:
      "my-10 -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10",
    table: "w-full border-collapse text-sm",
    thead: "border-b border-[#bba78f] text-left text-[#3c332b]",
    tr: "border-b border-[#e1d8cc]",
    th: "py-2.5 pr-4 font-medium text-[#3c332b]",
    td: "py-2.5 pr-4 align-top text-[#5f5449]",
    hr: "my-12 h-px border-none bg-[#d8cec2]",
    strong: "font-semibold text-[#2f2923]",
    em: "italic text-[#4b4239]",
  },
  serifHeadings: {
    article: "markdown-body markdown-body-serif-headings",
    h1: "mt-14 mb-7 border-b border-[#d6c7b6] pb-4 font-serif text-4xl font-normal leading-tight tracking-normal text-[#211c17]",
    h2: "mt-14 mb-5 font-serif text-3xl font-normal leading-tight tracking-normal text-[#2a241e]",
    h3: "mt-10 mb-3 font-serif text-2xl font-normal leading-tight tracking-normal text-[#3a3028]",
    p: "mb-5 text-[1.12rem] leading-8 text-[#5c5146]",
    blockquote:
      "my-9 border-l border-[#a98d70] pl-5 font-serif text-xl leading-8 text-[#5c4634]",
    link: "text-[#7d5e3f] underline decoration-[#c4ad95] underline-offset-4 transition-colors hover:text-[#3f2d1f] hover:decoration-[#7d5e3f]",
    img: "max-w-full border border-[#d6c7b6]",
    inlineCode:
      "border border-[#d6c7b6] bg-[#f4ecdf] px-1.5 py-0.5 font-mono text-[0.85em] text-[#6d4e32]",
    pre: "my-8 overflow-x-auto border border-[#d6c7b6] bg-[#2b241e] p-5 font-mono text-xs leading-relaxed text-[#f5efe4]",
    ul: "my-5 ml-5 list-disc space-y-2 text-[1.12rem] leading-8 text-[#5c5146] marker:text-[#b89d82]",
    ol: "my-5 ml-5 list-decimal space-y-2 text-[1.12rem] leading-8 text-[#5c5146] marker:text-[#9c8268]",
    tableWrap:
      "my-10 -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10",
    table: "w-full border-collapse text-sm",
    thead: "border-b border-[#a98d70] text-left text-[#3a3028]",
    tr: "border-b border-[#ded2c5]",
    th: "py-2.5 pr-4 font-medium text-[#3a3028]",
    td: "py-2.5 pr-4 align-top text-[#5c5146]",
    hr: "my-12 h-px border-none bg-[#d6c7b6]",
    strong: "font-semibold text-[#2a241e]",
    em: "font-serif italic text-[#4b3f35]",
  },
  serifAll: {
    article: "markdown-body markdown-body-serif-all font-serif",
    h1: "mt-14 mb-7 border-b border-[#d6c7b6] pb-4 text-4xl font-normal leading-tight tracking-normal text-[#211c17]",
    h2: "mt-14 mb-5 text-3xl font-normal leading-tight tracking-normal text-[#2a241e]",
    h3: "mt-10 mb-3 text-2xl font-normal leading-tight tracking-normal text-[#3a3028]",
    p: "mb-5 text-[1.08rem] leading-8 text-[#554a40]",
    blockquote:
      "my-9 border-l border-[#a98d70] pl-5 text-xl leading-8 text-[#5c4634] italic",
    link: "text-[#745235] underline decoration-[#c4ad95] underline-offset-4 transition-colors hover:text-[#3f2d1f] hover:decoration-[#745235]",
    img: "max-w-full border border-[#d6c7b6]",
    inlineCode:
      "border border-[#d6c7b6] bg-[#f4ecdf] px-1.5 py-0.5 font-mono text-[0.8em] text-[#6d4e32]",
    pre: "my-8 overflow-x-auto border border-[#d6c7b6] bg-[#2b241e] p-5 font-mono text-xs leading-relaxed text-[#f5efe4]",
    ul: "my-5 ml-5 list-disc space-y-2 text-[1.08rem] leading-8 text-[#554a40] marker:text-[#b89d82]",
    ol: "my-5 ml-5 list-decimal space-y-2 text-[1.08rem] leading-8 text-[#554a40] marker:text-[#9c8268]",
    tableWrap:
      "my-10 -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10",
    table: "w-full border-collapse text-sm",
    thead: "border-b border-[#a98d70] text-left text-[#3a3028]",
    tr: "border-b border-[#ded2c5]",
    th: "py-2.5 pr-4 font-medium text-[#3a3028]",
    td: "py-2.5 pr-4 align-top text-[#554a40]",
    hr: "my-12 h-px border-none bg-[#d6c7b6]",
    strong: "font-semibold text-[#2a241e]",
    em: "italic text-[#4b3f35]",
  },
  fieldNotes: {
    article: "markdown-body markdown-body-field-notes",
    h1: "mt-14 mb-6 border-b border-[#d8cec2] pb-3 font-mono text-2xl font-normal uppercase leading-tight tracking-[0.08em] text-[#211c17]",
    h2: "mt-12 mb-4 font-mono text-sm font-normal uppercase leading-6 tracking-[0.22em] text-[#7d5e3f]",
    h3: "mt-9 mb-3 font-mono text-sm font-normal uppercase leading-6 tracking-[0.16em] text-[#3c332b]",
    p: "mb-4 text-[0.96rem] leading-8 text-[#5d5248]",
    blockquote:
      "my-8 border-l border-[#b9a48c] bg-[#f4ecdf]/45 px-5 py-4 text-[0.96rem] leading-8 text-[#5d5248]",
    link: "text-[#7d5e3f] underline decoration-[#b9a48c] underline-offset-4 transition-colors hover:text-[#3f2d1f] hover:decoration-[#7d5e3f]",
    img: "max-w-full border border-[#d8cec2]",
    inlineCode:
      "border border-[#d8cec2] bg-[#f5efe4] px-1.5 py-0.5 font-mono text-[0.85em] text-[#6d4e32]",
    pre: "my-8 overflow-x-auto border border-[#d8cec2] bg-[#28231e] p-5 font-mono text-xs leading-relaxed text-[#f5efe4]",
    ul: "my-5 ml-5 list-disc space-y-2 text-[0.96rem] leading-8 text-[#5d5248] marker:text-[#9c8c7a]",
    ol: "my-5 ml-5 list-decimal space-y-2 text-[0.96rem] leading-8 text-[#5d5248] marker:text-[#9c8c7a]",
    tableWrap:
      "my-10 -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10",
    table: "w-full border-collapse font-mono text-xs",
    thead: "border-b border-[#b9a48c] text-left uppercase tracking-[0.12em] text-[#3c332b]",
    tr: "border-b border-[#e1d8cc]",
    th: "py-2.5 pr-4 font-normal text-[#3c332b]",
    td: "py-2.5 pr-4 align-top text-[#5d5248]",
    hr: "my-12 h-px border-none bg-[#d8cec2]",
    strong: "font-semibold text-[#2f2923]",
    em: "italic text-[#4b4239]",
  },
};

function createComponents(styles, openImage) {
  return {
  // Headings
  h1: ({ children }) => (
    <h1 className={styles.h1}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className={styles.h2}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className={styles.h3}>
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children, node }) => {
    // Image-only markdown paragraphs need to avoid nesting a figure inside <p>.
    const child = node?.children;
    if (
      child?.length === 2 &&
      child[0].type === "element" &&
      child[0].tagName === "img" &&
      child[1].type === "text" &&
      child[1].value.trim().match(/^Fig(?:\.|ure)?\s*\d*/i)
    ) {
      const image = child[0].properties ?? {};
      const caption = child[1].value.trim();
      return (
        <figure className="my-10">
          {renderImageButton({
            src: image.src,
            alt: image.alt,
            width: image.width,
            imageClassName: styles.img,
            openImage,
          })}
          <figcaption className="mt-3 text-left text-sm leading-6 text-[#76695c]">
            {caption}
          </figcaption>
        </figure>
      );
    }
    if (
      child?.length === 1 &&
      child[0].type === "element" &&
      child[0].tagName === "img"
    ) {
      return (
        <figure className="my-10 flex flex-col items-start">{children}</figure>
      );
    }
    return (
      <p className={styles.p}>{children}</p>
    );
  },

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className={styles.blockquote}>
      {children}
    </blockquote>
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className={styles.link}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Images
  img: ({ src, alt, width }) => (
    renderImageButton({
      src,
      alt,
      width,
      imageClassName: styles.img,
      openImage,
    })
  ),

  // Inline code
  code: ({ children, className, ...props }) => {
    // Block code is handled by pre > code; this catches inline code only
    const isInline = !className;
    if (isInline) {
      return (
        <code className={styles.inlineCode}>
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
    <pre className={styles.pre}>
      {children}
    </pre>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className={styles.ul}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={styles.ol}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  // Tables (GFM)
  table: ({ children }) => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className={styles.thead}>
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className={styles.tr}>{children}</tr>
  ),
  th: ({ children }) => (
    <th className={styles.th}>{children}</th>
  ),
  td: ({ children }) => (
    <td className={styles.td}>{children}</td>
  ),

  // Horizontal rule
  hr: () => <hr className={styles.hr} />,

  // Strong / em
  strong: ({ children }) => (
    <strong className={styles.strong}>{children}</strong>
  ),
  em: ({ children }) => <em className={styles.em}>{children}</em>,
  };
}

export default function MarkdownRenderer({ content, variant = "warmSans" }) {
  const [lightbox, setLightbox] = useState(null);
  const [zoom, setZoom] = useState(1);
  const pinchRef = useRef(null);
  const dragRef = useRef(null);
  const lightboxScrollRef = useRef(null);
  const processed = preprocess(content);
  const styles = presets[variant] ?? presets.warmSans;
  const components = createComponents(styles, (image) => {
    setLightbox(image);
    setZoom(1);
    pinchRef.current = null;
    dragRef.current = null;
  });

  useEffect(() => {
    if (!lightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setLightbox(null);
      }
      if (event.key === "+" || event.key === "=") {
        setZoom((value) => Math.min(value + 0.25, 4));
      }
      if (event.key === "-") {
        setZoom((value) => Math.max(value - 0.25, 0.5));
      }
      if (event.key === "0") {
        setZoom(1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightbox]);

  function closeLightbox() {
    pinchRef.current = null;
    dragRef.current = null;
    setLightbox(null);
  }

  function closeOnBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  }

  function startPinchZoom(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = null;
      pinchRef.current = {
        distance: getTouchDistance(event.touches),
        zoom,
      };
      return;
    }

    if (event.touches.length === 1 && zoom > 1 && lightboxScrollRef.current) {
      event.preventDefault();
      event.stopPropagation();
      const touch = event.touches[0];
      dragRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        scrollLeft: lightboxScrollRef.current.scrollLeft,
        scrollTop: lightboxScrollRef.current.scrollTop,
      };
    }
  }

  function updatePinchZoom(event) {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault();
      event.stopPropagation();
      const nextDistance = getTouchDistance(event.touches);
      setZoom(
        clampZoom(
          (pinchRef.current.zoom * nextDistance) / pinchRef.current.distance,
        ),
      );
      return;
    }

    if (event.touches.length === 1 && dragRef.current && lightboxScrollRef.current) {
      event.preventDefault();
      event.stopPropagation();
      const touch = event.touches[0];
      lightboxScrollRef.current.scrollLeft =
        dragRef.current.scrollLeft + dragRef.current.x - touch.clientX;
      lightboxScrollRef.current.scrollTop =
        dragRef.current.scrollTop + dragRef.current.y - touch.clientY;
    }
  }

  function endPinchZoom(event) {
    if (event.touches.length < 2) {
      pinchRef.current = null;
    }
    if (event.touches.length === 0) {
      dragRef.current = null;
    }
  }

  const lightboxImageStyle =
    zoom === 1
      ? {
          maxWidth: "calc(100vw - 3rem)",
          maxHeight: "calc(100vh - 7rem)",
          touchAction: "none",
          userSelect: "none",
        }
      : {
          width: `${zoom * 100}vw`,
          maxWidth: "none",
          maxHeight: "none",
          touchAction: "none",
          userSelect: "none",
        };

  const lightboxMarkup = lightbox ? (
    <div
      className="fixed inset-0 z-[100] bg-[#211c17]/94 text-[#f8f1e7]"
      role="dialog"
      aria-modal="true"
      aria-label={lightbox.alt || "Image preview"}
      onClick={closeOnBackdropClick}
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em]">
        <button
          type="button"
          className="border border-[#f8f1e7]/25 bg-[#211c17]/45 px-3 py-2 transition-colors hover:border-[#f8f1e7]/70"
          onClick={(event) => {
            event.stopPropagation();
            setZoom((value) => clampZoom(value - 0.25));
          }}
        >
          -
        </button>
        <button
          type="button"
          className="border border-[#f8f1e7]/25 bg-[#211c17]/45 px-3 py-2 transition-colors hover:border-[#f8f1e7]/70"
          onClick={(event) => {
            event.stopPropagation();
            setZoom(1);
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="border border-[#f8f1e7]/25 bg-[#211c17]/45 px-3 py-2 transition-colors hover:border-[#f8f1e7]/70"
          onClick={(event) => {
            event.stopPropagation();
            setZoom((value) => clampZoom(value + 0.25));
          }}
        >
          +
        </button>
        <button
          type="button"
          className="border border-[#f8f1e7]/25 bg-[#211c17]/45 px-3 py-2 transition-colors hover:border-[#f8f1e7]/70"
          onClick={(event) => {
            event.stopPropagation();
            closeLightbox();
          }}
        >
          Close
        </button>
      </div>

      <div
        ref={lightboxScrollRef}
        className="h-screen w-screen overflow-auto p-6 pt-20"
        onClick={closeOnBackdropClick}
        onWheel={(event) => {
          if (!event.metaKey && !event.ctrlKey) return;
          event.preventDefault();
          setZoom((value) =>
            clampZoom(value + (event.deltaY > 0 ? -0.12 : 0.12)),
          );
        }}
      >
        <div
          onClick={closeOnBackdropClick}
          className={
            zoom === 1
              ? "flex min-h-full min-w-full items-center justify-center"
              : "flex min-h-full w-max min-w-full items-start justify-start"
          }
        >
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="object-contain shadow-2xl shadow-black/40"
            style={lightboxImageStyle}
            draggable="false"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={startPinchZoom}
            onTouchMove={updatePinchZoom}
            onTouchEnd={endPinchZoom}
            onTouchCancel={endPinchZoom}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className={styles.article}>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={components}
        >
          {processed}
        </ReactMarkdown>
      </article>

      {lightboxMarkup ? createPortal(lightboxMarkup, document.body) : null}
    </>
  );
}
