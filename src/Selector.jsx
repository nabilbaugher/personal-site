import { Link } from 'react-router-dom'

const drafts = [
  {
    path: '/draft-1',
    title: 'Warm Light',
    desc: 'Stone palette, centered column, font-light heading, generous whitespace.',
    tags: ['Light', 'Centered', 'Stone'],
    accent: 'bg-stone-800 text-stone-100',
  },
  {
    path: '/draft-4',
    title: 'Monospace',
    desc: 'Monospaced type throughout, technical feel, compact and quiet.',
    tags: ['Mono', 'Technical', 'Neutral'],
    accent: 'bg-neutral-800 text-neutral-100',
  },
  {
    path: '/draft-7',
    title: 'Purkinje Watermark',
    desc: 'Warm stone with a very faint, full-width Purkinje cell behind the page.',
    tags: ['Light', 'Neuron', 'Watermark'],
    accent: 'bg-stone-700 text-stone-100',
  },
  {
    path: '/draft-8',
    title: 'Purkinje Hero',
    desc: 'Large Purkinje image anchors the hero, fading into the writing below.',
    tags: ['Hero', 'Neuron', 'Cards'],
    accent: 'bg-amber-900 text-amber-50',
  },
  {
    path: '/draft-9',
    title: 'Academic Journal',
    desc: 'Serif masthead, paper texture, Purkinje cell as a blended watermark.',
    tags: ['Serif', 'Paper', 'Journal'],
    accent: 'bg-stone-900 text-stone-50',
  },
  {
    path: '/draft-10',
    title: 'Left-Aligned Neuron',
    desc: 'Compact left column with the Purkinje tree as a right-side accent.',
    tags: ['Left', 'Minimal', 'Neuron'],
    accent: 'bg-stone-600 text-stone-50',
  },
]

export default function Selector() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Draft Picker
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Layout explorations for <span className="text-white font-medium">nabilbaugher.com</span>. Click to preview full-page.
          </p>
        </header>

        <div className="grid gap-4">
          {drafts.map((d) => (
            <Link
              key={d.path}
              to={d.path}
              className="group flex items-center gap-6 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 transition-all"
            >
              <span className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${d.accent}`}>
                {d.path.split('-')[1]}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white group-hover:text-zinc-50">
                  {d.title}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">{d.desc}</p>
                <div className="flex gap-2 mt-2">
                  {d.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-zinc-600 group-hover:text-zinc-300 transition-colors text-2xl">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
