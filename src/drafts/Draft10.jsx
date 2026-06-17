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

export default function Draft10() {
  return (
    <div className="relative isolate min-h-screen text-stone-700 font-sans">
      <PurkinjeLayer variant="right" baseClass="bg-white" />

      <Link
        to="/"
        className="fixed top-4 left-4 text-sm text-stone-400 hover:text-stone-700 transition-colors z-50"
      >
        &larr; Back to drafts
      </Link>

      <div className="relative z-10 max-w-3xl ml-[max(2rem,calc((100vw-48rem)/2))] pr-6 py-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-semibold tracking-tight text-stone-900 mb-3">
            Nabil Baugher
          </h1>
          <p className="text-stone-500 leading-relaxed max-w-lg">
            Computation &amp; Cognition, MIT. Prod cohort 3.0.
          </p>
          <div className="mt-4 flex gap-4 text-sm text-stone-400">
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
        <section className="mb-12">
          <h2 className="text-sm font-medium text-stone-900 mb-3">About</h2>
          <p className="text-stone-600 leading-relaxed max-w-lg">
            I&apos;m a builder who thinks about how minds work and how machines
            can be shaped to support that thinking. I care about the craft of
            software, clear writing, and ideas that hold up under scrutiny.
          </p>
        </section>

        {/* Writing */}
        <section className="mb-12">
          <h2 className="text-sm font-medium text-stone-900 mb-4">Writing</h2>
          <ul className="space-y-5 max-w-lg">
            {posts.map((post) => (
              <li
                key={post.title}
                className="group border-l-2 border-stone-200 hover:border-stone-400 pl-4 transition-colors"
              >
                <Link to={`/blog/${post.slug}`}>
                  <p className="text-stone-800 group-hover:text-stone-600 transition-colors">
                    {post.title}
                  </p>
                  <p className="text-stone-500 text-sm mt-0.5 leading-relaxed">
                    {post.desc}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-200 text-xs text-stone-400 max-w-lg">
          &copy; {new Date().getFullYear()} Nabil Baugher
        </footer>
      </div>
    </div>
  )
}
