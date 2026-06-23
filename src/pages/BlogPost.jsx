import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'
import PurkinjeLayer from '../components/PurkinjeLayer'

const POST_META = {
  'trm-halting-head': {
    file: '/blog_posts/trm_halting_head.md',
    title: "What TRM's Halting Head Actually Learns",
    date: 'Jun 2026',
  },
}

export default function BlogPost() {
  const { slug } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const meta = POST_META[slug]

  useEffect(() => {
    if (!meta) return
    fetch(meta.file)
      .then((r) => r.text())
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [meta])

  if (!meta) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center text-[#66594d]">
        <PurkinjeLayer variant="veil" />
        <div className="relative z-10 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#9a8b7a]">
            post not found
          </p>
          <Link
            to="/"
            className="text-sm text-[#76695c] underline decoration-[#b9ac9c] underline-offset-4 transition-colors hover:text-[#2f2923]"
          >
            &larr; home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[#352e27]">
      <PurkinjeLayer variant="veil" />

      <Link
        to="/"
        className="fixed left-4 top-4 z-50 font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a] transition-colors hover:text-[#352e27]"
      >
        &larr; home
      </Link>

      <div className="relative z-10 mx-auto max-w-[44rem] px-6 py-16 md:px-0 md:py-20">
        <article className="landing-rise">
          <header className="mb-12 border-b border-[#d8cec2] pb-10">
            <time className="mb-5 block font-mono text-xs uppercase tracking-[0.2em] text-[#9a8b7a]">
              {meta.date}
            </time>
            <h1 className="max-w-3xl font-serif text-[clamp(1.95rem,3.2vw,3rem)] font-normal leading-[1.08] tracking-normal text-[#211c17]">
              {meta.title}
            </h1>
          </header>

          {loading ? (
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a]">
              loading...
            </p>
          ) : (
            <MarkdownRenderer content={content} variant="serifHeadings" />
          )}

          <footer className="mt-16 border-t border-[#d8cec2] pt-8">
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a] transition-colors hover:text-[#352e27]"
            >
              &larr; back to home
            </Link>
          </footer>
        </article>
      </div>
    </main>
  )
}
