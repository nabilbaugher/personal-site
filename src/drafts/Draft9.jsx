import { Link } from 'react-router-dom'
import PurkinjeLayer from '../components/PurkinjeLayer.jsx'

const posts = [
  {
    title: 'A Verifier That Grades the Problem, Not the Answer Key',
    slug: 'verifier-grades-problem',
    date: 'Jun 2026',
    desc: 'Q head ranks valid shortest paths over exact labels on Maze-Hard.',
  },
  {
    title: 'Investigating attention over previous states in TRM',
    slug: 'trm-writeup',
    date: 'Jun 2025',
    desc: 'Testing whether memory over recursive states improves the Tiny Recursive Model.',
  },
]

export default function Draft9() {
  return (
    <div className="relative isolate min-h-screen text-stone-800 font-serif">
      <PurkinjeLayer variant="paper" baseClass="bg-[#f7f5f2]" />

      <Link
        to="/"
        className="fixed top-4 left-4 text-sm text-stone-400 hover:text-stone-700 transition-colors z-50 font-sans"
      >
        &larr; Back to drafts
      </Link>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        {/* Masthead */}
        <header className="mb-20 border-b border-stone-300 pb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400 font-sans mb-3">
            Computation &amp; Cognition
          </p>
          <h1 className="text-5xl md:text-6xl italic tracking-tight text-stone-900 leading-tight">
            Nabil Baugher
          </h1>
          <p className="mt-4 text-lg text-stone-500 leading-relaxed font-sans">
            MIT · Prod cohort 3.0
          </p>
          <div className="mt-5 flex gap-4 text-sm text-stone-400 font-sans">
            <a
              href="mailto:nabilbaugher@gmail.com"
              className="hover:text-stone-700 transition-colors underline underline-offset-4"
            >
              Email
            </a>
            <span className="text-stone-300">|</span>
            <a
              href="/Nabil_Baugher_Resume.pdf"
              className="hover:text-stone-700 transition-colors underline underline-offset-4"
            >
              Resume
            </a>
          </div>
        </header>

        {/* About */}
        <section className="mb-16 max-w-xl">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 font-sans mb-6">
            About
          </h2>
          <p className="text-xl text-stone-700 leading-relaxed">
            I work on systems that reason recursively and write about what
            that teaches us about minds, machines, and the craft between them.
          </p>
        </section>

        {/* Writing */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 font-sans mb-6">
            Selected writing
          </h2>
          <ul className="divide-y divide-stone-300">
            {posts.map((post, i) => (
              <li
                key={post.title}
                className={`py-6 group cursor-pointer ${i === 0 ? 'pt-0' : ''}`}
              >
                <Link to={`/blog/${post.slug}`}>
                  <p className="text-sm text-stone-400 font-sans mb-2">
                    {post.date}
                  </p>
                  <h3 className="text-2xl font-semibold text-stone-900 group-hover:text-stone-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-stone-600 text-sm mt-2 leading-relaxed font-sans">
                    {post.desc}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-stone-300 text-xs text-stone-400 font-sans flex justify-between">
          <span>&copy; {new Date().getFullYear()} Nabil Baugher</span>
        </footer>
      </div>
    </div>
  )
}
