import { Link } from "react-router-dom";
import PurkinjeLayer from "../components/PurkinjeLayer.jsx";

const posts = [
  {
    title: "What TRM's Halting Head Actually Learns",
    slug: "trm-halting-head",
    date: "Jun 2026",
  },
  {
    title: "Saying Things That Are True",
    href: "https://substack.com/home/post/p-191404123",
    date: "Mar 2026",
  },
];

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[#2f2923]">
      <PurkinjeLayer variant="field" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-24">
        <section className="landing-rise flex flex-col justify-center">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-[#9c8c7a]">
            YC S24 | Prod 3.0 | MIT Computation and Cognition '24
          </p>
          <h1 className="max-w-3xl text-[clamp(3.6rem,9vw,8.6rem)] font-light leading-[0.9] tracking-normal text-[#211c17]">
            Nabil Baugher
          </h1>
        </section>

        <section className="landing-fade-in mt-16 flex flex-col justify-center md:mt-0 md:pl-10">
          <p className="max-w-md text-lg leading-8 text-[#66594d]">
            My blog: research + opinions.
          </p>

          <div className="mt-12 divide-y divide-[#d8cec2] border-y border-[#d8cec2]">
            {posts.map((post) => (
              post.href ? (
                <a
                  key={post.href}
                  href={post.href}
                  className="group grid gap-2 py-5 md:grid-cols-[1fr_auto]"
                >
                  <span className="text-[#2f2923] transition-colors group-hover:text-[#7d5e3f]">
                    {post.title}
                  </span>
                  <time className="font-mono text-xs uppercase tracking-[0.16em] text-[#9c8c7a]">
                    {post.date}
                  </time>
                </a>
              ) : (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group grid gap-2 py-5 md:grid-cols-[1fr_auto]"
                >
                  <span className="text-[#2f2923] transition-colors group-hover:text-[#7d5e3f]">
                    {post.title}
                  </span>
                  <time className="font-mono text-xs uppercase tracking-[0.16em] text-[#9c8c7a]">
                    {post.date}
                  </time>
                </Link>
              )
            ))}
          </div>

          <div className="mt-8 flex gap-5 text-sm text-[#76695c]">
            <span>[first][last]@gmail.com</span>
            <a
              href="/Nabil_Baugher_Resume.pdf"
              className="transition-colors hover:text-[#2f2923]"
            >
              Resume
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
