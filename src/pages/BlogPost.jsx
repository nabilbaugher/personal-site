import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'

const POST_META = {
  'verifier-grades-problem': {
    file: '/blog_posts/verifier_grades_problem.md',
    title: 'A Verifier That Grades the Problem, Not the Answer Key',
    date: 'Jun 2026',
  },
  'trm-writeup': {
    file: '/blog_posts/trm_writeup.md',
    title: 'Investigating attention over previous states in TRM',
    date: 'Jun 2025',
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
      <div className="min-h-screen bg-neutral-50 text-neutral-600 font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-4">post not found</p>
          <Link to="/" className="text-xs text-neutral-400 hover:text-neutral-700 underline transition-colors">
            &larr; home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-600 font-mono">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Navigation */}
        <Link
          to="/"
          className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          &larr; home
        </Link>

        {/* Post header */}
        <header className="mt-10 mb-10">
          <time className="text-xs text-neutral-400 block mb-2">{meta.date}</time>
          <h1 className="text-2xl font-normal text-neutral-900 leading-snug">
            {meta.title}
          </h1>
        </header>

        {/* Post body */}
        {loading ? (
          <p className="text-sm text-neutral-400">loading...</p>
        ) : (
          <MarkdownRenderer content={content} />
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-200">
          <Link
            to="/"
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            &larr; back to home
          </Link>
        </footer>
      </div>
    </div>
  )
}
