import { Link } from "react-router-dom";

const posts = [
  {
    title: "A Verifier That Grades the Problem, Not the Answer Key",
    slug: "verifier-grades-problem",
    date: "Jun 2026",
  },
  {
    title: "Investigating attention over previous states in TRM",
    slug: "trm-writeup",
    date: "Jun 2025",
  },
  { title: "On building in public", slug: null, date: "soon" },
  { title: "Cognition as computation", slug: null, date: "soon" },
];

export default function Draft4() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-600 font-mono">
      <div className="max-w-xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl font-normal text-neutral-900 mb-2">
            Nabil Baugher
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Computation &amp; Cognition / MIT / Prod 3.0
          </p>
          <div className="mt-4 flex gap-3 text-xs text-neutral-400">
            <a
              href="mailto:nabilbaugher@gmail.com"
              className="hover:text-neutral-700 transition-colors underline"
            >
              email
            </a>
            <a
              href="/Nabil_Baugher_Resume.pdf"
              className="hover:text-neutral-700 transition-colors underline"
            >
              resume
            </a>
          </div>
        </header>

        {/* About */}
        <section className="mb-12">
          <h2 className="text-xs text-neutral-400 mb-4">// about</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            I&apos;m a builder who thinks about how minds work and how machines
            can be shaped to support that thinking. I care about the craft of
            software, clear writing, and ideas that hold up under scrutiny.
          </p>
        </section>

        {/* Writing */}
        <section className="mb-12">
          <h2 className="text-xs text-neutral-400 mb-4">// writing</h2>
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.title}
                className="group flex items-baseline justify-between text-sm"
              >
                {post.slug ? (
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-neutral-700 group-hover:text-neutral-500 transition-colors"
                  >
                    {post.title}
                  </Link>
                ) : (
                  <p className="text-neutral-700 group-hover:text-neutral-500 transition-colors cursor-default">
                    {post.title}
                  </p>
                )}
                <span className="text-xs text-neutral-300 ml-4 shrink-0">
                  [{post.date}]
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-neutral-200 text-xs text-neutral-400">
          &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
