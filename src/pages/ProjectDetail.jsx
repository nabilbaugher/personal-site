import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import PurkinjeLayer from "../components/PurkinjeLayer.jsx";
import { getProject, STATUS_STYLES } from "../data/projects.js";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProject(slug);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;
    fetch(`/project_pages/${slug}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project, slug]);

  if (!project) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center text-[#66594d]">
        <PurkinjeLayer variant="veil" />
        <div className="relative z-10 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#9a8b7a]">
            project not found
          </p>
          <Link
            to="/work"
            className="text-sm text-[#76695c] underline decoration-[#b9ac9c] underline-offset-4 transition-colors hover:text-[#2f2923]"
          >
            &larr; all work
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[#352e27]">
      <PurkinjeLayer variant="veil" />

      <Link
        to="/work"
        className="fixed left-4 top-4 z-50 font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a] transition-colors hover:text-[#352e27]"
      >
        &larr; all work
      </Link>

      <div className="relative z-10 mx-auto max-w-[42rem] px-6 py-16 md:px-0 md:py-20">
        <article className="landing-rise">
          <header className="mb-12 border-b border-[#d8cec2] pb-10">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${
                  STATUS_STYLES[project.status] ?? STATUS_STYLES.active
                }`}
              >
                {project.statusLabel}
              </span>
              <time className="font-mono text-xs uppercase tracking-[0.2em] text-[#9a8b7a]">
                {project.period}
              </time>
            </div>

            <h1 className="max-w-3xl font-serif text-[clamp(1.95rem,3.2vw,3rem)] font-normal leading-[1.08] text-[#211c17]">
              {project.title}
            </h1>

            <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-[#5c5146]">
              {project.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {project.stats.map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-2xl leading-none text-[#211c17]">
                    {s.n}
                  </div>
                  <div className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#9c8c7a]">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </header>

          {loading ? (
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a]">
              loading...
            </p>
          ) : content ? (
            <MarkdownRenderer content={content} variant="serifHeadings" />
          ) : (
            <p className="text-[#66594d]">
              Detail for this project is coming soon.
            </p>
          )}

          <footer className="mt-16 border-t border-[#d8cec2] pt-8">
            <Link
              to="/work"
              className="font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a] transition-colors hover:text-[#352e27]"
            >
              &larr; back to all work
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
