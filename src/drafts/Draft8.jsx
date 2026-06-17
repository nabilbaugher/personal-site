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

export default function Draft8() {
  return (
    <div className="relative isolate min-h-screen text-stone-800 font-sans">
      <PurkinjeLayer variant="hero" baseClass="bg-[#faf9f7]" />

      <Link
        to="/"
        className="fixed top-4 left-4 text-sm text-stone-400 hover:text-stone-700 transition-colors z-50"
      >
        &larr; Back to drafts
      </Link>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-48 pb-24">
        {/* Header */}
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-stone-900 mb-5">
            Nabil Baugher
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-lg mx-auto">
            Computation &amp; Cognition, MIT. Prod cohort 3.0.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-stone-400">
            <a
              href="mailto:nabilbaugher@gmail.com"
              className="hover:text-stone-700 transition-colors"
            >
              nabilbaugher@gmail.com
            </a>
            <span>&middot;</span>
            <a
              href="/Nabil_Baugher_Resume.pdf"
              className="hover:text-stone-700 transition-colors"
            >
              Resume
            </a>
          </div>
        </header>

        {/* About */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-5">
            About
          </h2>
          <p className="text-stone-600 leading-relaxed">
            I build systems and write about ideas that sit between minds and machines.
            I&apos;m interested in recursive models, the philosophy of cognition, and
            software done carefully.
          </p>
        </section>

        {/* Writing */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-6">
            Writing
          </h2>
          <ul className="space-y-5">
            {posts.map((post) => (
              <li
                key={post.title}
                className="group p-5 rounded-xl border border-stone-200/60 bg-white/60 hover:bg-white hover:border-stone-300 transition-all"
              >
                <Link to={`/blog/${post.slug}`}>
                  <p className="text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                    {post.title}
                  </p>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    {post.desc}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-stone-200 text-center text-sm text-stone-400">
          &copy; {new Date().getFullYear()} Nabil Baugher
        </footer>
      </div>
    </div>
  )
}
