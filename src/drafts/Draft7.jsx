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

export default function Draft7() {
  return (
    <div className="relative isolate min-h-screen text-stone-700 font-sans">
      <PurkinjeLayer variant="watermark" />

      <Link
        to="/"
        className="fixed top-4 left-4 text-sm text-stone-400 hover:text-stone-700 transition-colors z-50"
      >
        &larr; Back to drafts
      </Link>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="mb-20">
          <h1 className="text-6xl font-light tracking-tight text-stone-900 mb-4">
            Nabil Baugher
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed">
            Building at the intersection of computation and cognition.
            <br />
            BS in Computation &amp; Cognition from MIT. Prod cohort 3.0.
          </p>
          <div className="mt-6 flex gap-4 text-sm text-stone-400">
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
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-6">
            About
          </h2>
          <p className="text-stone-600 leading-relaxed">
            I&apos;m a builder who thinks about how minds work and how machines
            can be shaped to support that thinking. I care about the craft of
            software, clear writing, and ideas that hold up under scrutiny.
          </p>
        </section>

        {/* Writing */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-6">
            Writing
          </h2>
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.title} className="group">
                <Link to={`/blog/${post.slug}`}>
                  <p className="text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                    {post.title}
                  </p>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    {post.desc}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-stone-200 text-sm text-stone-400">
          &copy; {new Date().getFullYear()} Nabil Baugher
        </footer>
      </div>
    </div>
  )
}
