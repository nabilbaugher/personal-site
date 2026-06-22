import { Link } from 'react-router-dom'
import PurkinjeLayer from '../components/PurkinjeLayer.jsx'

const posts = [
  {
    title: 'Saying Things That Are True',
    href: 'https://substack.com/home/post/p-191404123',
    date: 'Mar 2026',
    topic: 'essay',
  },
]

export default function Draft13() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[#332c25]">
      <PurkinjeLayer variant="veil" />

      <Link
        to="/"
        className="fixed left-4 top-4 z-50 text-sm text-[#918270] transition-colors hover:text-[#332c25]"
      >
        &larr; Home
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-20 md:px-8 md:py-24">
        <header className="landing-rise">
          <div className="mb-8 h-px w-full bg-[#d8cdbf]" />
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <h1 className="text-[clamp(3.6rem,9vw,7rem)] font-extralight leading-[0.9] tracking-normal text-[#211c17]">
              Nabil Baugher
            </h1>
            <p className="max-w-sm pt-1 text-base leading-7 text-[#66594b] md:justify-self-end">
              Computation &amp; Cognition at MIT. Building tools and writing
              notes around reasoning, evaluation, and careful software.
            </p>
          </div>
        </header>

        <section className="landing-fade-in mt-16 md:mt-24">
          <div className="mb-6 grid gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#9a8b7a] md:grid-cols-[1fr_auto]">
            <h2>Index</h2>
            <div className="flex gap-5 md:justify-end">
              <span>[first][last]@gmail.com</span>
              <a
                href="/Nabil_Baugher_Resume.pdf"
                className="transition-colors hover:text-[#332c25]"
              >
                Resume
              </a>
            </div>
          </div>

          <div className="divide-y divide-[#d8cdbf] border-y border-[#d8cdbf]">
            {posts.map((post) => (
              <a
                key={post.href}
                href={post.href}
                className="group grid gap-3 py-6 transition-colors md:grid-cols-[8rem_1fr_auto] md:items-baseline"
              >
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#a09282]">
                  {post.topic}
                </span>
                <span className="text-2xl leading-8 text-[#2a241e] transition-colors group-hover:text-[#7d5e3f]">
                  {post.title}
                </span>
                <time className="font-mono text-xs uppercase tracking-[0.16em] text-[#a09282]">
                  {post.date}
                </time>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
